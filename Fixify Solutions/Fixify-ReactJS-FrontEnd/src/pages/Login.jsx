// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.login({ emailOrPhone, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setErr(data.message || "Login failed");
      }
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || "Network error");
    }
  };

  return (
    <div className="card small">
      <h2>Login</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit}>
        <label>Email or Phone</label>
        <input value={emailOrPhone} onChange={(e)=>setEmailOrPhone(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="btn">Login</button>
      </form>
      <div className="muted">
        <a href="/forgot">Forgot password?</a>
      </div>
      <br />
      <strong>Test Accounts:</strong>
      <br />
      customer1@gmail.com :: Customer@123
      <br />
      contractor1@gmail.com :: Contractor@123
      <br />
      admin1@gmail.com :: Admin@1234
    </div>
  );
}
