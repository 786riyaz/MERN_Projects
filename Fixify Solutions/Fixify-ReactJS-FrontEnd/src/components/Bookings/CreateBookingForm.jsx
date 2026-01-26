// src/components/bookings/CreateBookingForm.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";
import StatusBadge from "./StatusBadge";

export default function CreateBookingForm({ userId, savedAddresses, onCreated }) {
  const [services, setServices] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const [form, setForm] = useState({
    service_id: "",
    address: { line1: "", city: "", postalCode: "" },
    notes: "",
    bookingDate: "",
  });

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      const res = await api.getServices();
      setServices(res.data.data || []);
    };
    loadServices();
  }, []);

  // Autofill address when selecting saved address
  const selectAddress = (index) => {
    const addr = savedAddresses[index];
    setSelectedAddressIndex(index);

    setForm({
      ...form,
      address: {
        line1: addr.line1,
        city: addr.city,
        postalCode: addr.postalCode,
      },
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      await api.createBooking({
        service_id: form.service_id,
        customer_id: userId,
        notes: form.notes,
        bookingDate: form.bookingDate,
        address: { ...form.address },
      });

      alert("Booking created successfully!");

      setForm({
        service_id: "",
        address: { line1: "", city: "", postalCode: "" },
        notes: "",
        bookingDate: "",
      });

      setSelectedAddressIndex(null);
      onCreated();
    } catch (err) {
      console.error("Booking error:", err);
      alert(err?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="card mt">
      <h3>Create Service Request</h3>

      <form onSubmit={submitForm}>
        {/* SERVICE SELECT */}
        <select
          required
          value={form.service_id}
          onChange={(e) => setForm({ ...form, service_id: e.target.value })}
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* SAVED ADDRESS LIST */}
        {savedAddresses.length > 0 && (
          <div className="card" style={{ padding: 12, marginBottom: 12 }}>
            <h4>Select Address</h4>

            {savedAddresses.map((addr, index) => (
              <label key={index} style={{ display: "block", margin: "6px 0" }}>
                <input
                  type="radio"
                  name="addr"
                  checked={selectedAddressIndex === index}
                  onChange={() => selectAddress(index)}
                />
                <span style={{ marginLeft: 8 }}>
                  <strong>{addr.label}</strong> — {addr.line1}, {addr.city}{" "}
                  {addr.postalCode}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* MANUAL ADDRESS INPUTS */}
        <input
          type="text"
          placeholder="Address Line 1"
          required
          value={form.address.line1}
          onChange={(e) =>
            setForm({
              ...form,
              address: { ...form.address, line1: e.target.value },
            })
          }
        />

        <input
          type="text"
          placeholder="City"
          required
          value={form.address.city}
          onChange={(e) =>
            setForm({
              ...form,
              address: { ...form.address, city: e.target.value },
            })
          }
        />

        <input
          type="text"
          placeholder="Postal Code"
          required
          value={form.address.postalCode}
          onChange={(e) =>
            setForm({
              ...form,
              address: { ...form.address, postalCode: e.target.value },
            })
          }
        />

        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <input
          type="date"
          required
          value={form.bookingDate}
          onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
        />

        <button className="btn">Submit Request</button>
      </form>
    </div>
  );
}
