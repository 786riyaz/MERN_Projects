// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [err, setErr] = useState("");

  useEffect(()=>{
    (async()=>{
      try {
        const p = await api.getProfile();
        if (p.data.success) setProfile(p.data.data);
        const s = await api.getServices();
        if (s.data.success) setServices(s.data.data);
      } catch (error) {
        setErr("Could not load dashboard data");
      }
    })();
  },[]);

  return (
    <div>
      <h1>Dashboard</h1>
      {err && <div className="error">{err}</div>}
      <section className="grid">
        <div className="card">
          <h3>Profile</h3>
          {profile ? (
            <div>
              <div>{profile.firstName} {profile.lastName}</div>
              <div>{profile.email}</div>
              <div>Role: {profile.role}</div>
            </div>
          ) : <div>Loading...</div>}
        </div>

        <div className="card">
          <h3>Services ({services.length})</h3>
          <ul>
            {services.map(s => <li key={s._id}>{s.name} ::: {s.basePrice || "—"}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}
