// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.resetPassword({ email, otp, newPassword: password });
      if (data.success) {
        setMsg("Password reset successful. Redirecting to login...");
        setTimeout(()=>navigate("/login"), 1200);
      } else setMsg(data.message || "Error");
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="card small">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} readOnly />
        <input placeholder="New Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn">Reset Password</button>
      </form>
      {msg && <div className="info">{msg}</div>}
    </div>
  );
}
