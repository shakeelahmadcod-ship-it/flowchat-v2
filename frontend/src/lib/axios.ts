import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";
const isLocalhost = /(localhost|127\.0\.0\.1)/.test(host);
const isSecureProtocol = isBrowser ? window.location.protocol === "https:" : false;
const rawBaseUrlIsHttp = rawBaseUrl?.startsWith("http://") ?? false;
const needsProtocolUpgrade =
  Boolean(rawBaseUrlIsHttp) && isSecureProtocol && !/http:\/\/(localhost|127\.0\.0\.1)/.test(rawBaseUrl || "");
const isVercelProduction = host === "flowchat-v2.vercel.app";

const fallbackBackendUrl = isVercelProduction
  ? "https://flowchat-v2-production.up.railway.app"
  : undefined;

const shouldUseFallbackBackend = !rawBaseUrl && isBrowser && isVercelProduction;

export const apiUrlConfigWarning =
  needsProtocolUpgrade && !fallbackBackendUrl
    ? "NEXT_PUBLIC_API_URL is set to http:// while the app is loaded over HTTPS. Use https:// instead."
    : undefined;

const baseUrl = rawBaseUrl
  ? needsProtocolUpgrade
    ? rawBaseUrl.replace(/^http:\/\//, "https://")
    : rawBaseUrl
  : shouldUseFallbackBackend
  ? fallbackBackendUrl
  : isBrowser
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