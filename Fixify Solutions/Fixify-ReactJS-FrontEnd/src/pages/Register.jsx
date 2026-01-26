// src/pages/Register.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  // FORM STRUCTURE MATCHING USER MODEL
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    role: "customer",
  });

  // MULTIPLE ADDRESSES
  const [addresses, setAddresses] = useState([
    {
      label: "Home",
      line1: "",
      city: "",
      postalCode: "",
      lat: "",
      lng: "",
    },
  ]);

  // HANDLERS
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateAddress = (index, field, value) => {
    const copy = [...addresses];
    copy[index][field] = value;
    setAddresses(copy);
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      { label: "", line1: "", city: "", postalCode: "", lat: "", lng: "" },
    ]);
  };

  const removeAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  // SUBMIT
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const payload = {
        ...form,
        addresses: addresses.filter((a) => a.line1.trim() !== ""), // Only valid ones
      };

      const res = await api.register(payload);

      if (res.data.success) {
        setMsg("Registered successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMsg(res.data.message || "Registration failed.");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="card small">
      <h2>Register</h2>

      {msg && <div className="info">{msg}</div>}

      <form onSubmit={submit}>
        {/* === PERSONAL INFO === */}
        <h3>Personal Information</h3>

        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={update("firstName")}
          required
        />

        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={update("lastName")}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update("email")}
          required
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={update("phone")}
          required
        />

        <select value={form.gender} onChange={update("gender")} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select value={form.role} onChange={update("role")}>
          <option value="customer">Customer</option>
          <option value="contractor">Contractor</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
          required
        />

        {/* === MULTIPLE ADDRESSES === */}
        <h3 style={{ marginTop: 20 }}>Addresses</h3>

        {addresses.map((a, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: 12, marginBottom: 12, background: "var(--input-bg)" }}
          >
            <label>Label</label>
            <input
              placeholder="Home / Office / etc."
              value={a.label}
              onChange={(e) => updateAddress(i, "label", e.target.value)}
            />

            <label>Address Line</label>
            <input
              placeholder="Address Line 1"
              value={a.line1}
              onChange={(e) => updateAddress(i, "line1", e.target.value)}
            />

            <div className="grid">
              <div>
                <label>City</label>
                <input
                  value={a.city}
                  onChange={(e) => updateAddress(i, "city", e.target.value)}
                />
              </div>

              <div>
                <label>Postal Code</label>
                <input
                  value={a.postalCode}
                  onChange={(e) =>
                    updateAddress(i, "postalCode", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid">
              <div>
                <label>Latitude (optional)</label>
                <input
                  value={a.lat}
                  onChange={(e) => updateAddress(i, "lat", e.target.value)}
                />
              </div>

              <div>
                <label>Longitude (optional)</label>
                <input
                  value={a.lng}
                  onChange={(e) => updateAddress(i, "lng", e.target.value)}
                />
              </div>
            </div>

            {addresses.length > 1 && (
              <button
                type="button"
                className="btn-small danger"
                onClick={() => removeAddress(i)}
              >
                Delete Address
              </button>
            )}
          </div>
        ))}

        <button type="button" className="btn mt" onClick={addAddress}>
          + Add Another Address
        </button>

        {/* === SUBMIT === */}
        <button className="btn" type="submit" style={{ marginTop: 20, marginLeft: 10 }}>
          Register
        </button>
      </form>
    </div>
  );
}
