import { useState } from "react";
import { registerUser } from "../../api/auth.api";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    await registerUser(form);
    alert("Registration successful");
  };

  return (
    <form onSubmit={submitHandler}>
      <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
