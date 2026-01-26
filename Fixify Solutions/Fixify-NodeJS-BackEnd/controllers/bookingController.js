// controllers/bookingController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

/**
 * Helper: Build Mongo query & options from req.query
 * Option A date filtering: ?start=YYYY-MM-DD&end=YYYY-MM-DD (createdAt)
 *
 * Supported query params:
 *  - page (default 1), limit (default 10, max 100)
 *  - sort (e.g. sort=-createdAt)
 *  - status (string)
 *  - serviceId, contractorId, customerId (ObjectId)
 *  - start, end (YYYY-MM-DD) -> createdAt range
 *  - rejected (true/false) -> whether booking has entries in rejected_by
 */
function buildQueryAndOptions(queryParams = {}) {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    status,
    serviceId,
    contractorId,
    customerId,
    start,
    end,
    rejected,
  } = queryParams;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (status) filter.status = status;
  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) filter.service_id = serviceId;
  if (contractorId && mongoose.Types.ObjectId.isValid(contractorId)) filter.contractor_id = contractorId;
  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) filter.customer_id = customerId;

  if (start || end) {
    filter.createdAt = {};
    if (start) {
      const s = new Date(start);
      if (!isNaN(s)) filter.createdAt.$gte = s;
    }
    if (end) {
      const e = new Date(end);
      if (!isNaN(e)) {
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }
    }
    if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
  }

  if (typeof rejected !== "undefined") {
    const r = String(rejected).toLowerCase();
    if (r === "true") filter.rejected_by = { $exists: true, $ne: [] };
    else if (r === "false") filter.$or = [{ rejected_by: { $exists: false } }, { rejected_by: { $size: 0 } }];
  }

  const options = { skip, limit: limitNum, sort };

  return { filter, options, page: pageNum, limit: limitNum };
}

/**
 * Apply population for common lookups
 */
function applyPopulation(query) {
  return query
    .populate("customer_id", "name email")
    .populate("contractor_id", "name email")
    .populate("service_id", "name")
    .select("-__v");
}

/* ===== Controllers ===== */

/**
 * GET ALL BOOKINGS (with filters, pagination, sorting)
 * Access rules:
 * - admin: can view all (subject to query filters)
 * - customer: can only view their own bookings (req.user.id)
 * - contractor: can view bookings assigned to them OR that match contractorId filter (req.user.id enforced)
 */
exports.getBookings1 = async (req, res) => {
  try {
    const user = req.user; // from middleware
    const incomingQuery = { ...req.query };

    // enforce role-based visibility
    if (user.role === "customer") {
      incomingQuery.customerId = user.id;
    } else if (user.role === "contractor") {
      // if contractor didn't pass contractorId, force it to their id
      if (!incomingQuery.contractorId) incomingQuery.contractorId = user.id;
    } // admin: leave as is

    const { filter, options, page, limit } = buildQueryAndOptions(incomingQuery);

    const total = await Booking.countDocuments(filter);
    const query = Booking.find(filter).skip(options.skip).limit(options.limit).sort(options.sort);
    applyPopulation(query);
    const bookings = await query.exec();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getBookings error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * GET SINGLE BOOKING
 * - admin: can view any
 * - customer: only their booking
 * - contractor: only if assigned to them or if their id is in rejected_by (optional)
 */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking id" });

    let query = Booking.findById(id);
    applyPopulation(query);
    const booking = await query.exec();

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // enforce visibility
    if (user.role === "customer" && booking.customer_id.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view this booking" });
    }
    if (user.role === "contractor") {
      const isAssigned = booking.contractor_id && booking.contractor_id.toString() === user.id;
      const hasRejected = Array.isArray(booking.rejected_by) && booking.rejected_by.map(String).includes(user.id);
      if (!isAssigned && !hasRejected) {
        return res.status(403).json({ success: false, message: "Forbidden: cannot view this booking" });
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * CREATE BOOKING
 * - customers create bookings; admin may also create
 * - if customer, override customer_id with req.user.id (prevents spoofing)
 */
exports.createBooking = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "contractor") {
      return res.status(403).json({ success: false, message: "Contractors cannot create bookings" });
    }

    const payload = { ...req.body };

    if (user.role === "customer") {
      // ensure customer_id matches authenticated user
      payload.customer_id = user.id;
    } else if (user.role === "admin") {
      // admin must specify a customer_id in body
      if (!payload.customer_id || !mongoose.Types.ObjectId.isValid(payload.customer_id)) {
        return res.status(400).json({ success: false, message: "customer_id is required and must be valid" });
      }
    }

    // set timestamps (mongoose timestamps option handles createdAt/updatedAt on save too)
    payload.createdAt = new Date();
    payload.updatedAt = new Date();

    const newBooking = await Booking.create(payload);

    const populated = await Booking.findById(newBooking._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * UPDATE BOOKING
 * - admin: can update any fields
 * - customer: can update only their bookings and only certain safe fields (address, issue_images, bookingDate)
 * - contractor: limited to status transitions if assigned (e.g., in_progress -> completed) - validated below
 */
exports.updateBooking1 = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Role checks and allowed updates
    let updates = { ...req.body };

    if (user.role === "customer") {
      // customer must own the booking
      if (booking.customer_id.toString() !== user.id) {
        return res.status(403).json({ success: false, message: "Forbidden: cannot update this booking" });
      }
      // restrict fields customer can update
      const allowed = ["address", "issue_images", "notes", "bookingDate"];
      updates = allowed.reduce((acc, key) => {
        if (req.body.hasOwnProperty(key)) acc[key] = req.body[key];
        return acc;
      }, {});
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "No permitted fields to update" });
      }
    } else if (user.role === "contractor") {
      // contractor can only update status of bookings assigned to them (or add notes)
      const isAssigned = booking.contractor_id && booking.contractor_id.toString() === user.id;
      if (!isAssigned) return res.status(403).json({ success: false, message: "Forbidden: not assigned to this booking" });

      // allow status change and maybe contractor_notes
      const allowed = ["status", "contractor_notes"];
      updates = allowed.reduce((acc, key) => {
        if (req.body.hasOwnProperty(key)) acc[key] = req.body[key];
        return acc;
      }, {});
      if (updates.status) {
        // basic allowed transitions: assigned -> in_progress -> completed
        const allowedStatuses = ["in_progress", "completed", "rejected"];
        if (!allowedStatuses.includes(updates.status)) {
          return res.status(400).json({ success: false, message: "Invalid status change by contractor" });
        }
      }
    } else if (user.role === "admin") {
      // admin can update anything except createdAt
      delete updates.createdAt;
    }

    updates.updatedAt = new Date();

    const updated = await Booking.findByIdAndUpdate(id, updates, { new: true });
    const populated = await Booking.findById(updated._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error("updateBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * CANCEL BOOKING
 * - customer (owner) or admin can cancel
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (user.role === "customer" && booking.customer_id.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot cancel this booking" });
    }

    // perform cancel
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, message: "Booking cancelled successfully", data: populated });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * DELETE BOOKING
 * - Admin only (route protected by authorizeRoles)
 */
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking id" });
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking removed" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * ASSIGN CONTRACTOR
 * - Admin only (route protected)
 */
exports.assignContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const { contractor_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(contractor_id)) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { contractor_id, status: "assigned", updatedAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Booking not found" });

    const populated = await Booking.findById(updated._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, message: "Contractor assigned", data: populated });
  } catch (err) {
    console.error("assignContractor error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * REJECT BOOKING (append user ID to rejected_by)
 * - contractors reject bookings (route allows contractor and admin)
 * - if contractor: enforce that user_id === req.user.id
 */
exports.rejectBooking1 = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // If contractor, ensure they are rejecting as themselves
    console.log("Rejecting booking:", id, "by user_id:", user_id, "authenticated user:", user);
    if (user.role === "contractor" && user.id !== user_id) {
      return res.status(403).json({ success: false, message: "Forbidden: contractor can only reject as themselves" });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $addToSet: { rejected_by: user_id }, status: "pending", updatedAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Booking not found" });

    const populated = await Booking.findById(updated._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, message: "Booking rejected", data: populated });
  } catch (err) {
    console.error("rejectBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * GET BOOKINGS BY CUSTOMER
 * - customer: only allowed for themselves (route-level check also exists)
 * - admin: can fetch any customer's bookings
 */
exports.getBookingsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: "Invalid customer id" });
    }

    // Extra enforcement: customer can only request their own
    if (user.role === "customer" && user.id !== customerId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view other customer's bookings" });
    }

    const { filter, options, page, limit } = buildQueryAndOptions({ ...req.query, customerId });

    const total = await Booking.countDocuments(filter);
    const query = Booking.find(filter).skip(options.skip).limit(options.limit).sort(options.sort);
    applyPopulation(query);
    const bookings = await query.exec();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getBookingsByCustomer error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * GET BOOKINGS BY CONTRACTOR
 * - contractor: only their own bookings
 * - admin: any
 */
exports.getBookingsByContractor = async (req, res) => {
  try {
    const { contractorId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(contractorId)) {
      return res.status(400).json({ success: false, message: "Invalid contractor id" });
    }

    if (user.role === "contractor" && user.id !== contractorId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view other contractor's bookings" });
    }

    const { filter, options, page, limit } = buildQueryAndOptions({ ...req.query, contractorId });

    const total = await Booking.countDocuments(filter);
    const query = Booking.find(filter).skip(options.skip).limit(options.limit).sort(options.sort);
    applyPopulation(query);
    const bookings = await query.exec();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getBookingsByContractor error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * GET BOOKINGS REJECTED BY CONTRACTOR
 * - contractor: can view only their own rejected bookings
 * - admin: can view any
 */
exports.getRejectedBookingsByContractor = async (req, res) => {
  try {
    const { contractorId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(contractorId)) {
      return res.status(400).json({ success: false, message: "Invalid contractor id" });
    }

    if (user.role === "contractor" && user.id !== contractorId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view other contractor's rejected bookings" });
    }

    // Build filter forcing rejected_by contain contractorId
    const { options, page, limit } = buildQueryAndOptions(req.query);
    const baseFilter = { rejected_by: contractorId };

    // Allow other query params (status, start/end, etc) by merging
    const extraFilter = buildQueryAndOptions(req.query).filter;
    Object.assign(baseFilter, extraFilter);

    const total = await Booking.countDocuments(baseFilter);
    const query = Booking.find(baseFilter).skip(options.skip).limit(options.limit).sort(options.sort);
    applyPopulation(query);
    const bookings = await query.exec();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getRejectedBookingsByContractor error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ... keep the top of the file unchanged (imports, helpers, buildQueryAndOptions, applyPopulation)

exports.getBookings = async (req, res) => {
  try {
    const user = req.user; // from middleware
    const incomingQuery = { ...req.query };

    // NOTE: we won't force contractorId anymore.
    // Instead we'll allow admin to see all, customers to see their own,
    // and contractors to see unassigned bookings OR bookings assigned to them.
    if (user.role === "customer") {
      incomingQuery.customerId = user.id;
    }

    const { filter, options, page, limit } = buildQueryAndOptions(incomingQuery);

    // For contractors, modify the filter to show:
    //  - bookings assigned to them
    //  - OR bookings that are unassigned (contractor_id is null/missing)
    // Also exclude bookings where they have already rejected (rejected_by contains their id).
    let effectiveFilter = { ...filter };

    if (user.role === "contractor") {
      // base OR clause: assigned to them OR unassigned
      const unassignedOrAssignedToMe = {
        $or: [
          { contractor_id: user.id },
          { contractor_id: { $exists: false } },
          { contractor_id: null }
        ]
      };

      // exclude bookings where this contractor already rejected
      const excludeRejectedByMe = {
        $or: [
          { rejected_by: { $exists: false } },
          { rejected_by: { $size: 0 } },
          { rejected_by: { $not: { $in: [user.id] } } } // will be interpreted by Mongo
        ]
      };

      // Note: to be safe, make sure we correctly combine with existing filter
      // If existing filter already contains $and/$or logic just nest them
      effectiveFilter = { $and: [effectiveFilter, unassignedOrAssignedToMe, excludeRejectedByMe] };
    }

    const total = await Booking.countDocuments(effectiveFilter);
    const query = Booking.find(effectiveFilter).skip(options.skip).limit(options.limit).sort(options.sort);
    applyPopulation(query);
    const bookings = await query.exec();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getBookings error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Normalize incoming body
    const body = { ...req.body };

    let updates = {};

    if (user.role === "customer") {
      // customer must own the booking
      if (booking.customer_id.toString() !== user.id) {
        return res.status(403).json({ success: false, message: "Forbidden: cannot update this booking" });
      }
      // restrict fields customer can update
      const allowed = ["address", "issue_images", "notes", "bookingDate"];
      updates = allowed.reduce((acc, key) => {
        if (body.hasOwnProperty(key)) acc[key] = body[key];
        return acc;
      }, {});
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "No permitted fields to update" });
      }
    } else if (user.role === "contractor") {
      // Contractor flow:
      // - If booking is unassigned (no contractor_id), allow contractor to claim it (assign to self + set status "assigned")
      // - If booking is assigned to this contractor, allow status transitions (in_progress/completed) and contractor_notes
      // - Otherwise forbidden
      const assignedTo = booking.contractor_id ? booking.contractor_id.toString() : null;

      if (!assignedTo) {
        // Claim the job
        updates.contractor_id = user.id;
        // If status provided and is a valid admin-level status, ignore it — set to 'assigned' by default
        updates.status = "assigned";
      } else if (assignedTo === user.id) {
        // allowed updates for assigned contractor
        const allowed = ["status", "contractor_notes"];
        updates = allowed.reduce((acc, key) => {
          if (body.hasOwnProperty(key)) acc[key] = body[key];
          return acc;
        }, {});

        // validate status transitions for contractor (only these allowed)
        if (updates.status) {
          const allowedStatuses = ["in_progress", "completed", "rejected"];
          if (!allowedStatuses.includes(updates.status)) {
            return res.status(400).json({ success: false, message: "Invalid status change by contractor" });
          }
        }
      } else {
        return res.status(403).json({ success: false, message: "Forbidden: not assigned to this booking" });
      }
    } else if (user.role === "admin") {
      // admin can update anything except createdAt
      updates = { ...body };
      delete updates.createdAt;
    }

    // timestamps
    updates.updatedAt = new Date();

    const updated = await Booking.findByIdAndUpdate(id, updates, { new: true });
    const populated = await Booking.findById(updated._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error("updateBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // If contractor, ensure they are rejecting as themselves
    if (user.role === "contractor" && user.id !== user_id) {
      return res.status(403).json({ success: false, message: "Forbidden: contractor can only reject as themselves" });
    }

    // Add contractor to rejected_by and keep booking unassigned (status remains pending)
    const updated = await Booking.findByIdAndUpdate(
      id,
      { $addToSet: { rejected_by: user_id }, status: "pending", updatedAt: new Date(), contractor_id: null },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Booking not found" });

    const populated = await Booking.findById(updated._id)
      .populate("customer_id", "name email")
      .populate("contractor_id", "name email")
      .populate("service_id", "name")
      .select("-__v")
      .exec();

    res.status(200).json({ success: true, message: "Booking rejected", data: populated });
  } catch (err) {
    console.error("rejectBooking error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
