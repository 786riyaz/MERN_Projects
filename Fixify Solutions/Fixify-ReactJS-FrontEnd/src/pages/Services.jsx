// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // <-- main fix
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
  });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await api.getServices();
    const profileRes = await api.getProfile();

    if (res.data.success) setServices(res.data.data);

    if (profileRes.data.success) {
      const user = profileRes.data.data;
      setProfile(user);

      // Check if the logged-in user is admin
      if (user.role === "admin") {
        setIsAdmin(true);
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateService(editing._id, form);
        setMsg("Updated");
      } else {
        await api.createService({ ...form, basePrice: Number(form.basePrice) });
        setMsg("Created");
      }

      setForm({ name: "", description: "", basePrice: "", category: "" });
      setEditing(null);
      load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete service?")) return;
    await api.deleteService(id);
    load();
  };

  const edit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      basePrice: s.basePrice || "",
      category: s.category || "",
    });
  };

  return (
    <div>
      <h1>Services</h1>
      {msg && <div className="info">{msg}</div>}

      {/* SHOW FORM ONLY IF ADMIN */}
      {isAdmin && (
        <div className="card">
          <h3>{editing ? "Edit Service" : "Create Service"}</h3>
          <form onSubmit={submit}>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              placeholder="Base Price"
              value={form.basePrice}
              onChange={(e) =>
                setForm({ ...form, basePrice: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <button className="btn">{editing ? "Update" : "Create"}</button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: "",
                    description: "",
                    basePrice: "",
                    category: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Services</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              {isAdmin && <th>Actions</th> /* Column will exist but stays empty for non-admin */}
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.basePrice}</td>

                <td>
                  {/* SHOW BUTTONS ONLY IF ADMIN */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => edit(s)}
                        className="btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(s._id)}
                        className="btn-small danger"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
