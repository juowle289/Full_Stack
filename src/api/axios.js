import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register')

    // Chỉ tự động đăng xuất + chuyển về /login khi 401 xảy ra trên một phiên
    // ĐÃ đăng nhập (token hết hạn/không hợp lệ). Nếu 401 đến từ chính request
    // đăng nhập/đăng ký (sai email/mật khẩu), để component tự hiển thị lỗi,
    // không reload trang - tránh xóa mất thông báo lỗi vừa hiện ra.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api