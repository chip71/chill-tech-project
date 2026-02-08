import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9999/api",
  withCredentials: true, // bật luôn (không hại, hỗ trợ cookie nếu cần)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ⚠️ nếu bạn lưu key khác thì đổi ở đây
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
