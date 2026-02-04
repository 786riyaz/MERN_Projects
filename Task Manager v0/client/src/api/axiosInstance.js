import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ BASIC AUTH HEADER
axiosInstance.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");

  if (auth) {
    const { username, password } = JSON.parse(auth);

    // base64 encode username:password
    const token = btoa(`${username}:${password}`);

    config.headers.Authorization = `Basic ${token}`;
  }

  return config;
});

export default axiosInstance;
