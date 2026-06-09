import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = rawBaseUrl
  ? rawBaseUrl.startsWith("http://") && typeof window !== "undefined" && window.location.protocol === "https:"
    ? rawBaseUrl.replace(/^http:\/\//, "https://")
    : rawBaseUrl
  : typeof window !== "undefined"
  ? window.location.origin
  : "http://localhost:8000";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;