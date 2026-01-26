// frontend/src/pages/Bookings.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BookingsTable from "../components/Bookings/BookingsTable";

export default function Bookings() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    start: "",
    end: "",
  });

  const [totalPages, setTotalPages] = useState(1);

  const [assignBookingId, setAssignBookingId] = useState(null);
  const [contractorList, setContractorList] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [createForm, setCreateForm] = useState({
    service_id: "",
    address: { line1: "", city: "", postalCode: "" },
    notes: "",
    bookingDate: "",
  });

  /* --------------------------
        LOAD PROFILE
  --------------------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.getProfile();
        const user = res.data.data;

        setRole(user.role);
        setUserId(user._id);
        setSavedAddresses(user.addresses || []);
      } catch (err) {
        console.error("Profile Load Error:", err);
      }
    };

    loadUser();
  }, []);

  /* --------------------------
        LOAD SERVICES
  --------------------------- */
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.getServices();
        setServices(res.data.data || []);
      } catch (err) {
        console.error("Service Load Error:", err);
      }
    };
    loadServices();
  }, []);

  /* --------------------------
      FETCH BOOKINGS (ALL ROLES)
  --------------------------- */
  const fetchBookings = async () => {
    if (!role || !userId) return;

    setLoading(true);
    try {
      let res;

      if (role === "admin") {
        res = await api.getBookings(filters);
      } else if (role === "customer") {
        res = await api.getBookingsByCustomer(userId, filters);
      } else if (role === "contractor") {
        // Backend filters unassigned + assigned-to-contractor
        res = await api.getBookings(filters);
      }

      setBookings(res?.data?.data || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (err) {
      console.error("Bookings Fetch Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role && userId) fetchBookings();
  }, [role, userId, filters]);

  /* --------------------------
        LOAD CONTRACTORS (ADMIN)
  --------------------------- */
  useEffect(() => {
    if (role === "admin") loadContractors();
  }, [role]);

  const loadContractors = async () => {
    try {
      const res = await api.getAllUsers();
      setContractorList(res.data.data.filter((u) => u.role === "contractor"));
    } catch (err) {
      console.error("Load contractors error:", err);
    }
  };

  /* --------------------------
        CREATE BOOKING
  --------------------------- */
  const createNewBooking = async (e) => {
    e.preventDefault();
    try {
      await api.createBooking({
        service_id: createForm.service_id,
        customer_id: userId, // backend enforces this
        notes: createForm.notes,
        bookingDate: createForm.bookingDate,
        address: { ...createForm.address },
      });

      alert("Booking created successfully!");

      setCreateForm({
        service_id: "",
        address: { line1: "", city: "", postalCode: "" },
        notes: "",
        bookingDate: "",
      });
      setSelectedAddressIndex(null);
      setShowCreateForm(false);
      fetchBookings();
    } catch (err) {
      console.error("Booking create error", err);
      alert(err?.response?.data?.message || "Error creating booking");
    }
  };

  /* --------------------------
        ADMIN: ASSIGN CONTRACTOR
  --------------------------- */
  const assignContractorToBooking = async () => {
    if (!selectedContractor) return alert("Select contractor");

    try {
      await api.assignContractor(assignBookingId, selectedContractor);
      setAssignBookingId(null);
      setSelectedContractor("");
      fetchBookings();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Unable to assign contractor");
    }
  };

  /* --------------------------
        UI
  --------------------------- */
  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📦 Bookings</h2>

        {role === "customer" && (
          <button className="btn" onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? "✖ Close" : "➕ Create New Service Request"}
          </button>
        )}
      </div>

      {/* Create Booking Form */}
      {showCreateForm && (
        <div className="card mt">
          <h3>Create Service Request</h3>

          <form onSubmit={createNewBooking}>
            {/* Service Select */}
            <select
              required
              value={createForm.service_id}
              onChange={(e) => setCreateForm({ ...createForm, service_id: e.target.value })}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="card" style={{ padding: 12 }}>
                <h4>Select Address</h4>

                {savedAddresses.map((addr, index) => (
                  <label key={index} style={{ display: "block", margin: "6px 0" }}>
                    <input
                      type="radio"
                      name="addr"
                      checked={selectedAddressIndex === index}
                      onChange={() => {
                        setSelectedAddressIndex(index);
                        setCreateForm((prev) => ({
                          ...prev,
                          address: {
                            line1: addr.line1,
                            city: addr.city,
                            postalCode: addr.postalCode,
                          },
                        }));
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>
                      <strong>{addr.label}</strong> — {addr.line1}, {addr.city} {addr.postalCode}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Address inputs */}
            <input
              type="text"
              required
              placeholder="Address Line 1"
              value={createForm.address.line1}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, line1: e.target.value },
                })
              }
            />

            <input
              type="text"
              required
              placeholder="City"
              value={createForm.address.city}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, city: e.target.value },
                })
              }
            />

            <input
              type="text"
              required
              placeholder="Postal Code"
              value={createForm.address.postalCode}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, postalCode: e.target.value },
                })
              }
            />

            <textarea
              placeholder="Notes (optional)"
              value={createForm.notes}
              onChange={(e) =>
                setCreateForm({ ...createForm, notes: e.target.value })
              }
            />

            <input
              type="date"
              required
              value={createForm.bookingDate}
              onChange={(e) =>
                setCreateForm({ ...createForm, bookingDate: e.target.value })
              }
            />

            <button className="btn" style={{ marginTop: 10 }}>
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters({ ...filters, start: e.target.value })}
          />

          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters({ ...filters, end: e.target.value })}
          />

          <button
            className="btn"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 10,
                status: "",
                start: "",
                end: "",
              })
            }
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <BookingsTable
        bookings={bookings}
        loading={loading}
        role={role}
        userId={userId}
        onRefresh={fetchBookings}
        onAssign={(id) => setAssignBookingId(id)}
      />

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: 12 }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className="btn-small"
            style={{
              background:
                filters.page === i + 1 ? "var(--accent)" : "#ddd",
            }}
            onClick={() => setFilters({ ...filters, page: i + 1 })}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Admin Assign Modal */}
      {assignBookingId && (
        <div className="modal">
          <div className="modal-box card small">
            <h3>Assign Contractor</h3>

            <select
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
            >
              <option value="">Select contractor</option>
              {contractorList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div
              className="modal-actions"
              style={{ textAlign: "right", marginTop: 12 }}
            >
              <button className="btn" onClick={assignContractorToBooking}>
                Assign
              </button>
              <button
                className="btn danger"
                onClick={() => setAssignBookingId(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
