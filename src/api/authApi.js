import api from './axios'

export const authApi = {
  login(data) {
    return api.post('/api/identity/auth/login', data)
  },

  register(data) {
    return api.post('/api/identity/auth/register', data)
  },

  me() {
    return api.get('/api/identity/auth/me')
  },

  // ⚠️ Giả định endpoint - cần xác nhận với backend trước khi dùng thật.
  changePassword(data) {
    return api.put('/api/identity/auth/change-password', data)
  },

  // ⚠️ Giả định endpoint - cần xác nhận với backend trước khi dùng thật.
  updateProfile(data) {
    return api.put('/api/identity/auth/me', data)
  }
}