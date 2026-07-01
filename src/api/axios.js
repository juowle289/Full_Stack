import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const failedUrl = error.config?.url || "";
    const isAuthEndpoint =
      failedUrl.includes("/auth/login") || failedUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

export default api;
