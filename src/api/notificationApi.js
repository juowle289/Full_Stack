import api from './axios'

export const notificationApi = {
  getAll(isRead) {
    return api.get('/api/identity/notifications', { params: { isRead } })
  },

  markAsRead(id) {
    return api.patch(`/api/identity/notifications/${id}/read`)
  },

  markAllAsRead() {
    return api.patch('/api/identity/notifications/read-all')
  }
}
