// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await api.getProfile();
      if (res.data.success) {
        const data = res.data.data;
        setUser(data);

        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });

        setAddresses(data.addresses || []);
      }
    })();
  }, []);

  const enableEdit = () => setEditMode(true);

  const cancelEdit = () => {
    setEditMode(false);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });
    setAddresses(user.addresses || []);
  };

  const saveProfile = async () => {
    try {
      const res = await api.updateProfile({ ...form, addresses });

      if (res.data.success) {
        setUser(res.data.data);
        setMsg("Profile updated successfully");
        setEditMode(false);
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error updating profile");
    }
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        label: "",
        line1: "",
        city: "",
        postalCode: "",
        lat: "",
        lng: "",
      },
    ]);
  };

  const updateAddress = (i, field, value) => {
    const updated = [...addresses];
    updated[i][field] = value;
    setAddresses(updated);
  };

  const removeAddress = (i) => {
    setAddresses(addresses.filter((_, idx) => idx !== i));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Your Profile</h1>
      {msg && <div className="info">{msg}</div>}

      {/* ===================== VIEW MODE ===================== */}
      {!editMode && (
        <div className="card">
          <div className="grid">
            <div>
              <h2>Personal Info</h2>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>

            <div className="center">
              {user.avatarUrl && (
                <img
                  src={`${API_BASE}${user.avatarUrl}`}
                  alt="Avatar"
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginTop: "20px",
                    border: "3px solid var(--border)",
                  }}
                />
              )}
            </div>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h2>Addresses</h2>
          <div className="grid">
            {user.addresses?.map((a, i) => (
              <div className="card address-box" key={i}>
                <h3>{a.label}</h3>
                <p>{a.line1}</p>
                <p>{a.city} - {a.postalCode}</p>
                <small>
                  Lat: {a.lat} | Lng: {a.lng}
                </small>
              </div>
            ))}
          </div>

          <button className="btn mt" onClick={enableEdit}>
            Edit Profile
          </button>
        </div>
      )}

      {/* ===================== EDIT MODE ===================== */}
      {editMode && (
        <div className="card">
          <h2>Edit Profile</h2>

          <div className="grid">
            <div>
              <label>First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />

              <label>Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />

              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="center">
              {user.avatarUrl && (
                <>
                  <p><strong>Avatar</strong></p>
                  <img
                    src={`${API_BASE}${user.avatarUrl}`}
                    width="120"
                    style={{
                      borderRadius: "50%",
                      marginBottom: "10px",
                      border: "2px solid var(--border)",
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* ===================== ADDRESS EDITING ===================== */}
          <h2 style={{ marginTop: "20px" }}>Manage Addresses</h2>

          {addresses.map((a, i) => (
            <div className="card address-edit-box" key={i}>
              <label>Label</label>
              <input
                value={a.label}
                onChange={(e) => updateAddress(i, "label", e.target.value)}
              />

              <label>Address Line</label>
              <input
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
                    onChange={(e) => updateAddress(i, "postalCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid">
                <div>
                  <label>Latitude</label>
                  <input
                    value={a.lat}
                    onChange={(e) => updateAddress(i, "lat", e.target.value)}
                  />
                </div>

                <div>
                  <label>Longitude</label>
                  <input
                    value={a.lng}
                    onChange={(e) => updateAddress(i, "lng", e.target.value)}
                  />
                </div>
              </div>

              <button className="btn-small danger" onClick={() => removeAddress(i)}>
                Delete Address
              </button>
            </div>
          ))}

          <button className="btn mt" onClick={addAddress}>
            + Add New Address
          </button>

          <div style={{ marginTop: "25px" }}>
            <button className="btn save-btn" onClick={saveProfile}>Save</button>
            <button className="btn cancel-btn" onClick={cancelEdit} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
