import api from './api'

export const departmentService = {
  async getDepartments() {
    const { data } = await api.get('/api/departments')
    return data
  },
  async getDepartment(id) {
    const { data } = await api.get(`/api/departments/${id}`)
    return data
  },
  async getDepartmentStats(id) {
    const { data } = await api.get(`/api/departments/${id}/stats`)
    return data
  },
  async createDepartment(deptData) {
    const { data } = await api.post('/api/departments', deptData)
    return data
  },
  async updateDepartment(id, deptData) {
    const { data } = await api.put(`/api/departments/${id}`, deptData)
    return data
  },
  async getDepartmentOfficers(id) {
    const { data } = await api.get(`/api/departments/${id}/officers`)
    return data
  },
  async getDepartmentComplaints(id, params = {}) {
    const { data } = await api.get(`/api/departments/${id}/complaints`, { params })
    return data
  },
}
