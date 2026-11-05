import api from './api'

export const recommendationService = {
  async getRecommendations(params = {}) {
    const { data } = await api.get('/api/recommendations', { params })
    return data
  },
  async getRecommendation(id) {
    const { data } = await api.get(`/api/recommendations/${id}`)
    return data
  },
  async createRecommendation(recData) {
    const { data } = await api.post('/api/recommendations', recData)
    return data
  },
  async updateRecommendation(id, recData) {
    const { data } = await api.put(`/api/recommendations/${id}`, recData)
    return data
  },
  async updateStatus(id, status) {
    const { data } = await api.put(`/api/recommendations/${id}/status`, { status })
    return data
  },
}
