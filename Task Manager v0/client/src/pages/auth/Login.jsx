import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

const submitHandler = async (e) => {
  e.preventDefault();

  const res = await loginUser(form);

  // store user + credentials
  const authData = {
    username: form.username,
    password: form.password,
    role: res.data.user.role
  };

  localStorage.setItem("auth", JSON.stringify(authData));

  login(res.data.user);
  navigate("/", { replace: true });
};


  return (
    <form onSubmit={submitHandler}>
      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Login</button>
    </form>
  );
};

export default Login;
