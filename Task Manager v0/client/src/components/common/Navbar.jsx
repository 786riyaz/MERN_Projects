import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // hide navbar when not logged in

  return (
    <nav style={nav}>
      <div>
        <NavLink to="/" style={link}>Dashboard</NavLink>
        <NavLink to="/tasks" style={link}>Tasks</NavLink>

        {user.role === "admin" && (
          <NavLink to="/admin" style={link}>Admin</NavLink>
        )}
      </div>

      <div>
        <span style={{ marginRight: "12px" }}>
          {user.username} ({user.role})
        </span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;

/* STYLES */
const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 16px",
  background: "#222",
  color: "#fff"
};

const link = {
  color: "#fff",
  marginRight: "16px",
  textDecoration: "none"
};
