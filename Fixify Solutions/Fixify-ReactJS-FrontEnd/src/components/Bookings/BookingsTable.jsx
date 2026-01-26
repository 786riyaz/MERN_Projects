// src/components/bookings/BookingsTable.jsx
import React from "react";
import api from "../../api";
import StatusBadge from "./StatusBadge";

export default function BookingsTable({
  bookings,
  loading,
  role,
  onRefresh,
  onAssign,
  userId,
}) {
  const userRole = role?.toLowerCase();

  const handleReject = async (id) => {
    if (!window.confirm("Reject this job?")) return;
    try {
      await api.rejectBooking(id, userId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to reject booking");
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.updateBooking(id, {
        contractor_id: userId,
        status: "assigned",
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to accept booking");
    }
  };

  const handleStatus = async (id, newStatus) => {
    try {
      await api.updateBooking(id, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (!bookings.length) return <div className="card">No bookings found</div>;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <table className="table">
        <thead>
          <tr>
            <th>Service</th>
            {userRole !== "customer" && <th>Customer</th>}
            {userRole !== "contractor" && <th>Contractor</th>}
            <th>Date</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => {
            const assignedId = b.contractor_id?._id || b.contractor_id;
            const isMine = assignedId === userId;
            const unassigned = !b.contractor_id;

            return (
              <tr key={b._id}>
                <td>{b.service_id?.name}</td>

                {userRole !== "customer" && <td>{b.customer_id?.name}</td>}

                {userRole !== "contractor" && (
                  <td data-label="Contractor">
                    {b.contractor_id?.name || "—"}
                  </td>
                )}
                <td>
                  {b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td>
                  <StatusBadge status={b.status} />
                </td>

                <td style={{ textAlign: "right" }}>
                  {/* CUSTOMER CANCEL */}
                  {userRole === "customer" && b.status === "pending" && (
                    <button
                      className="btn-small danger"
                      onClick={() => api.cancelBooking(b._id).then(onRefresh)}
                    >
                      Cancel
                    </button>
                  )}

                  {/* ADMIN ACTIONS */}
                  {userRole === "admin" && (
                    <>
                      <button
                        className="btn-small"
                        onClick={() => onAssign(b._id)}
                      >
                        Assign
                      </button>
                      <button
                        className="btn-small danger"
                        onClick={() => api.deleteBooking(b._id).then(onRefresh)}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {/* CONTRACTOR WORKFLOW */}
                  {userRole === "contractor" && (
                    <>
                      {/* A. UNASSIGNED JOB → Accept or Reject */}
                      {unassigned && (
                        <>
                          <button
                            className="btn-small success"
                            onClick={() => handleAccept(b._id)}
                          >
                            Accept
                          </button>

                          <button
                            className="btn-small danger"
                            onClick={() => handleReject(b._id)}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* B. Assigned to ME */}
                      {isMine && b.status === "assigned" && (
                        <button
                          className="btn-small"
                          onClick={() => handleStatus(b._id, "in_progress")}
                        >
                          Start
                        </button>
                      )}

                      {isMine && b.status === "in_progress" && (
                        <button
                          className="btn-small success"
                          onClick={() => handleStatus(b._id, "completed")}
                        >
                          Complete
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
