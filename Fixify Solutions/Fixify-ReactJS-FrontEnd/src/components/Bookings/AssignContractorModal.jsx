// src/components/bookings/AssignContractorModal.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AssignContractorModal({ bookingId, onClose, onAssigned }) {
  const [contractors, setContractors] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const loadContractors = async () => {
      const res = await api.getAllUsers();
      setContractors(res.data.data.filter((u) => u.role === "contractor"));
    };
    loadContractors();
  }, []);

  const assignContractor = async () => {
    if (!selected) return alert("Select contractor");

    await api.assignContractor(bookingId, selected);
    onAssigned();
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-box card small">
        <h3>Assign Contractor</h3>

        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select contractor</option>
          {contractors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="modal-actions" style={{ textAlign: "right", marginTop: 12 }}>
          <button className="btn" onClick={assignContractor}>
            Assign
          </button>
          <button className="btn danger" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
