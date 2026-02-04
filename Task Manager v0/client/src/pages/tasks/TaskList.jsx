import { useEffect, useState, useContext } from "react";
import {
  getTasks,
  deleteTask,
  updateTask
} from "../../api/task.api";
import TaskForm from "./TaskForm";
import { AuthContext } from "../../context/AuthContext";

const TaskList = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadTasks = async () => {
    const data = await getTasks(user.username);
    setTasks(data);
  };

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus =
      task.status === "Pending" ? "Completed" : "Pending";

    await updateTask(task.id, { status: newStatus });
    loadTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Task Management</h2>

      <button onClick={handleAdd}>+ Add Task</button>

      {showForm && (
        <TaskForm
          task={editingTask}
          refresh={loadTasks}
          onClose={() => setShowForm(false)}
        />
      )}

      <table style={{ width: "100%", marginTop: "16px" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>
                <button onClick={() => toggleStatus(task)}>
                  {task.status}
                </button>
              </td>
              <td>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{ marginLeft: "8px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
