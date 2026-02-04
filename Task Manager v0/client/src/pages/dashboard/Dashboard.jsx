import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getTasks } from "../../api/task.api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      // ✅ getTasks already returns ARRAY
      const data = await getTasks(user.username);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "Completed"
  ).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div style={{ padding: "24px" }}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div>
          <h2>Task Manager Dashboard</h2>
          <p>
            Welcome, <strong>{user.username}</strong> ({user.role})
          </p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {/* STATS */}
      <section style={statsContainer}>
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Completed" value={completedTasks} />
        <StatCard title="Pending" value={pendingTasks} />
      </section>

      {/* RECENT TASKS */}
      <section style={sectionStyle}>
        <h3>Recent Tasks</h3>

        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>
                    <button onClick={() => navigate("/tasks")}>
                      View All
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ADMIN ONLY */}
      {user.role === "admin" && (
        <section style={adminSection}>
          <h3>Admin Panel</h3>
          <p>You have administrative privileges.</p>
          <button onClick={() => navigate("/admin")}>
            Go to Admin Panel
          </button>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

/* SMALL COMPONENT */
const StatCard = ({ title, value }) => (
  <div style={statCard}>
    <h4>{title}</h4>
    <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>
  </div>
);

/* STYLES */
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginBottom: "32px"
};

const statCard = {
  padding: "16px",
  background: "#f4f4f4",
  borderRadius: "8px",
  textAlign: "center"
};

const sectionStyle = {
  marginBottom: "32px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const adminSection = {
  padding: "16px",
  background: "#ffecec",
  borderRadius: "8px"
};
