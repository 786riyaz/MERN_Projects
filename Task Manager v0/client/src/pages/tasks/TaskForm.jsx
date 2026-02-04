import { useEffect, useState } from "react";
import { createTask, updateTask } from "../../api/task.api";

const TaskForm = ({ task, refresh, onClose }) => {
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

    if (task) {
      await updateTask(task.id, { title, description, status });
    } else {
      await createTask({ title, description, status });
    }

    refresh();
    onClose();
  };

  return (
    <form onSubmit={submitHandler}>
      <h3>{task ? "Edit Task" : "Add Task"}</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        placeholder="Description"
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

      <button type="submit">
        {task ? "Update" : "Create"}
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};

export default TaskForm;
