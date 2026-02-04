import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminTaskForm from "./AdminTaskForm";

const AdminPanel = () => {
  const [tasksByUser, setTasksByUser] = useState({});
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    const res = await axiosInstance.get("/api/tasks");
    setTasksByUser(res.data.tasks || {});
  };

  const deleteTask = async (username, taskId) => {
    await axiosInstance.delete(`/api/tasks/${taskId}`, {
      headers: { "X-Target-User": username }
    });
    loadAllTasks();
  };

  const startEdit = (username, task) => {
    setEditing({ username, task });
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Admin Panel</h2>
      <p>Manage all users’ tasks</p>

      {Object.entries(tasksByUser).map(([username, tasks]) => (
        <section key={username} style={userSection}>
          <h3>User: {username}</h3>

          <table style={table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>
                    <button onClick={() => startEdit(username, task)}>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(username, task.id)}
                      style={{ marginLeft: "8px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* EDIT MODAL */}
      {editing && (
        <AdminTaskForm
          task={editing.task}
          username={editing.username}
          refresh={loadAllTasks}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;

/* STYLES */
const userSection = {
  marginBottom: "32px",
  padding: "16px",
  background: "#f9f9f9",
  borderRadius: "8px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};
