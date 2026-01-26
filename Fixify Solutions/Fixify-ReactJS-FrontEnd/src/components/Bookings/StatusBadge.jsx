// src/components/bookings/StatusBadge.jsx
import React from "react";

export default function StatusBadge({ status }) {
  const colors = {
    pending: "#777",
    assigned: "#3563e9",
    in_progress: "#f1c40f",
    completed: "#2ecc71",
    cancelled: "#e74c3c",
    rejected: "#e67e22",
  };

  return (
    <span
      style={{
        background: colors[status] || "#999",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        textTransform: "capitalize",
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}
