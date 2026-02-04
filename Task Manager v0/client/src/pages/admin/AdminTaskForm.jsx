import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AdminTaskForm = ({ task, username, onClose, refresh }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);

  const submitHandler = async (e) => {
    e.preventDefault();

    await axiosInstance.put(
      `/api/tasks/${task.id}`,
      { title, description, status },
      {
        headers: {
          "X-Target-User": username
        }
      }
    );

    refresh();
    onClose();
  };

  return (
    <div style={modal}>
      <form onSubmit={submitHandler} style={form}>
        <h3>Edit Task (User: {username})</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <div style={{ marginTop: "12px" }}>
          <button type="submit">Update</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTaskForm;

/* BASIC MODAL */
const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const form = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "320px"
};
