import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem('accessToken')
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register')

    // Chỉ tự ép về /login khi TRƯỚC ĐÓ đã có token (phiên đăng nhập thật sự
    // hết hạn/không hợp lệ). Nếu đang duyệt web ẩn danh (chưa từng đăng nhập)
    // mà một API nào đó yêu cầu quyền và trả 401, KHÔNG redirect — để
    // component tự xử lý (hiện empty state), vì đây là trang public.
    if (error.response?.status === 401 && !isAuthEndpoint && hadToken) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api;
