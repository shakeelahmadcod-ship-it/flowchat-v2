import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = (() => {
  if (rawBaseUrl) {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      rawBaseUrl.startsWith("http://")
    ) {
      const isLocalhost = /https?:\/\/(localhost|127\.0\.0\.1)/.test(rawBaseUrl);
      if (!isLocalhost) {
        return rawBaseUrl.replace(/^http:\/\//, "https://");
      }
      console.error(
        "NEXT_PUBLIC_API_URL is insecure (http) while the app is loaded over HTTPS. Update it to https:// or use a secure backend host."
      );
    }
    return rawBaseUrl;
  }

  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:") {
      console.error(
        "NEXT_PUBLIC_API_URL is not set in production. API requests will use the frontend origin.",
      );
    }
    return window.location.origin;
  }

  return "http://localhost:8000";
})();

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