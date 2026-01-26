// /routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { isAuthenticated, authorizeRoles } = require("../middleware/authMiddleware");

/*
  Important route ordering:
  - Put specific static routes before routes with :id to avoid route param conflicts.
*/

/* Filtered endpoints (protected) */
router.get(
  "/customer/:customerId",
  isAuthenticated,
  // customer may view only their own bookings; admin can view any customer's bookings
  (req, res, next) => {
    // allow customers and admin; contractors not allowed here
    console.log("Authenticated user:", req.user);
    console.log("Requested customerId:", req.params.customerId);
    if (req.user.role === "customer" && req.user.id !== req.params.customerId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot access other customer's bookings" });
    }
    if (req.user.role === "contractor") {
      return res.status(403).json({ success: false, message: "Forbidden: contractors cannot view this endpoint" });
    }
    next();
  },
  bookingController.getBookingsByCustomer
);

router.get(
  "/contractor/:contractorId/rejected",
  isAuthenticated,
  // contractor can view their own rejected bookings; admin can view any
  (req, res, next) => {
    if (req.user.role === "contractor" && req.user.id !== req.params.contractorId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view other contractor's rejected bookings" });
    }
    next();
  },
  bookingController.getRejectedBookingsByContractor
);

router.get(
  "/contractor/:contractorId",
  isAuthenticated,
  // contractor can only view their own; admin can view any contractor
  (req, res, next) => {
    console.log("Authenticated user:", req.user);
    console.log("Requested contractorId:", req.params.contractorId);
    if (req.user.role === "contractor" && req.user.id !== req.params.contractorId) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot view other contractor's bookings" });
    }
    next();
  },
  bookingController.getBookingsByContractor
);

/* Generic listing (with filters) */
router.get("/", isAuthenticated, bookingController.getBookings);

/* Single booking */
router.get("/:id", isAuthenticated, bookingController.getBookingById);

/* Create booking
   - customers create bookings; admin can also create if needed
*/
router.post("/", isAuthenticated, (req, res, next) => {
  if (req.user.role === "contractor") {
    return res.status(403).json({ success: false, message: "Contractors cannot create bookings" });
  }
  // If customer, ensure customer_id in body matches req.user.id (or auto-set below in controller)
  next();
}, bookingController.createBooking);

/* Update booking
   - admin can update anything
   - customer can update their own booking (but not status/contractor fields)
   - contractor limited updates only (e.g., status in_progress/completed if assigned) - enforced in controller
*/
router.put("/:id", isAuthenticated, bookingController.updateBooking);

/* Delete booking: admin only */
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), bookingController.deleteBooking);

/* Actions */
/* Cancel booking: customer (owner) or admin */
router.patch("/:id/cancel", isAuthenticated, bookingController.cancelBooking);

/* Assign contractor: admin only */
router.patch("/:id/assign", isAuthenticated, authorizeRoles("contractor", "admin"), bookingController.assignContractor);

/* Contractor rejects booking (append to rejected_by)
   - contractor must be authenticated and user_id in body must match req.user.id
*/
router.patch("/:id/reject", isAuthenticated, authorizeRoles("contractor", "admin"), bookingController.rejectBooking);

module.exports = router;
