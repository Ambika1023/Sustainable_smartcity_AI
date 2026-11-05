import api from './api'

export const complaintService = {
  async getComplaints(params = {}) {
    const { data } = await api.get('/api/complaints', { params })
    return data // { complaints, total, page, per_page, total_pages }
  },
  async getComplaint(id) {
    const { data } = await api.get(`/api/complaints/${id}`)
    return data
  },
  async getComplaintStats() {
    const { data } = await api.get('/api/complaints/stats')
    return data
  },
  async getComplaintHistory(id) {
    const { data } = await api.get(`/api/complaints/${id}/history`)
    return data
  },
  async assignComplaint(id, assignData) {
    const { data } = await api.put(`/api/complaints/${id}/assign`, assignData)
    return data
  },
  async updateStatus(id, statusData) {
    const { data } = await api.put(`/api/complaints/${id}/status`, statusData)
    return data
  },
  async addRemark(id, remark) {
    const { data } = await api.post(`/api/complaints/${id}/remarks`, { remark })
    return data
  },
  async createComplaint(complaintData) {
    const { data } = await api.post('/api/complaints', complaintData)
    return data
  },
  async getRecentComplaints(limit = 5) {
    const { data } = await api.get('/api/complaints', { params: { limit, sort: '-created_at' } })
    return data
  },
}
