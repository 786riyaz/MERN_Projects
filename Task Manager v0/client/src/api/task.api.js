import axiosInstance from "./axiosInstance";

export const getTasks = async (username) => {
  const res = await axiosInstance.get("/api/tasks");

  // 🔴 NORMALIZE BACKEND RESPONSE
  const tasksByUser = res.data.tasks || {};
  return tasksByUser[username] || [];
};

export const createTask = (data) =>
  axiosInstance.post("/api/tasks", data);

export const updateTask = (id, data) =>
  axiosInstance.put(`/api/tasks/${id}`, data);

export const deleteTask = (id) =>
  axiosInstance.delete(`/api/tasks/${id}`);
