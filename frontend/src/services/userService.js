import api from './api'

export const userService = {
  async getUsers(params = {}) {
    const { data } = await api.get('/api/users', { params })
    return data
  },
  async getUser(id) {
    const { data } = await api.get(`/api/users/${id}`)
    return data
  },
  async createUser(userData) {
    const { data } = await api.post('/api/users', userData)
    return data
  },
  async updateUser(id, userData) {
    const { data } = await api.put(`/api/users/${id}`, userData)
    return data
  },
  async deactivateUser(id) {
    const { data } = await api.delete(`/api/users/${id}`)
    return data
  },
  async activateUser(id) {
    const { data } = await api.post(`/api/users/${id}/activate`)
    return data
  },
  async getUserActivity(id) {
    const { data } = await api.get(`/api/users/${id}/activity`)
    return data
  },
}
