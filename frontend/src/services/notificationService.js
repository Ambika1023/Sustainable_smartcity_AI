import api from './api'

export const notificationService = {
  async getNotifications(params = {}) {
    const { data } = await api.get('/api/notifications', { params })
    return data
  },
  async markRead(id) {
    const { data } = await api.put(`/api/notifications/${id}/read`)
    return data
  },
  async markAllRead() {
    const { data } = await api.put('/api/notifications/mark-all-read')
    return data
  },
  async getUnreadCount() {
    const { data } = await api.get('/api/notifications/unread-count')
    return data
  },
  async deleteNotification(id) {
    const { data } = await api.delete(`/api/notifications/${id}`)
    return data
  },
}
