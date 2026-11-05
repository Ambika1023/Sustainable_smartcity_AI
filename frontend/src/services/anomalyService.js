import api from './api'

export const anomalyService = {
  async getAnomalies(params = {}) {
    const { data } = await api.get('/api/anomalies', { params })
    return data
  },
  async getAnomaly(id) {
    const { data } = await api.get(`/api/anomalies/${id}`)
    return data
  },
  async detectAnomalies() {
    const { data } = await api.post('/api/anomalies/detect')
    return data
  },
  async updateAnomalyStatus(id, updateData) {
    const { data } = await api.put(`/api/anomalies/${id}/status`, updateData)
    return data
  },
  async getAnomalyStats() {
    const { data } = await api.get('/api/anomalies/stats')
    return data
  },
}
