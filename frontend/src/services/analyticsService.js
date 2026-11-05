import api from './api'

export const analyticsService = {
  async getEnvironmentalData(period = 'monthly', wardId = null) {
    const params = { period }
    if (wardId) params.ward_id = wardId
    const { data } = await api.get('/api/analytics/environmental', { params })
    return data
  },
  async getComplaintTrends(days = 30) {
    const { data } = await api.get('/api/analytics/complaint-trends', { params: { days } })
    return data
  },
  async getDepartmentPerformance() {
    const { data } = await api.get('/api/analytics/department-performance')
    return data
  },
  async getWardDistribution() {
    const { data } = await api.get('/api/analytics/ward-distribution')
    return data
  },
  async getSustainabilityScore() {
    const { data } = await api.get('/api/analytics/sustainability-score')
    return data
  },
  async getSummary() {
    const { data } = await api.get('/api/analytics/summary')
    return data
  },
  async exportCSV(params = {}) {
    const response = await api.get('/api/analytics/export', {
      params,
      responseType: 'blob',
    })
    return response
  },
  async seedSampleData() {
    const { data } = await api.post('/api/analytics/seed-sample-data')
    return data
  },
  async getCategoryBreakdown() {
    const { data } = await api.get('/api/analytics/category-breakdown')
    return data
  },
}
