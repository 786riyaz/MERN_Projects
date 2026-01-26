// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.forgotPassword({ email });
      if (data.success) {
        setMsg("OTP sent. Proceed to Verify OTP.");
        navigate("/verify-otp", { state: { email } });
      } else setMsg(data.message || "Error");
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="card small">
      <h2>Forgot Password</h2>
      {msg && <div className="info">{msg}</div>}
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="btn">Send OTP</button>
      </form>
    </div>
  );
}
