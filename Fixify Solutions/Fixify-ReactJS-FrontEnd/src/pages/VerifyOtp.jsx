// src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.verifyOtp({ email, otp });
      if (data.success) {
        navigate("/reset-password", { state: { email, otp } });
      } else setMsg(data.message || "Invalid OTP");
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="card small">
      <h2>Verify OTP</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} readOnly />
        <input placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} required />
        <button className="btn">Verify</button>
      </form>
      {msg && <div className="error">{msg}</div>}
    </div>
  );
}
