import { defineStore } from 'pinia'
import { authApi } from '../api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('accessToken') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || '',
    fullName: (state) => state.user?.fullName || '',
    email: (state) => state.user?.email || '',
    userId: (state) => state.user?.userId || state.user?.id || ''
  },

  actions: {
    async login(email, password) {
      const response = await authApi.login({ email, password })

      // Backend trả về dạng phẳng: { token, fullName, role } - không có accessToken/user lồng nhau.
      this.token = response.data.token
      localStorage.setItem('accessToken', this.token)

      // Gọi /auth/me để lấy đầy đủ thông tin user (email, userId...) vì login chỉ trả tối thiểu.
      try {
        const meRes = await authApi.me()
        this.user = meRes.data
      } catch {
        // Nếu /me lỗi, vẫn dùng tạm thông tin tối thiểu từ response login.
        this.user = { fullName: response.data.fullName, role: response.data.role }
      }

      localStorage.setItem('user', JSON.stringify(this.user))

      return this.user
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  }
})