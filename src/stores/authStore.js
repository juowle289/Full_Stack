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

      this.token = response.data.accessToken
      this.user = response.data.user

      localStorage.setItem('accessToken', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))

      return response.data.user
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  }
})