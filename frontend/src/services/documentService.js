import api from './api'

export const documentService = {
  async getDocuments(params = {}) {
    const { data } = await api.get('/api/documents', { params })
    return data
  },
  async uploadDocument(formData) {
    const { data } = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async deleteDocument(id) {
    const { data } = await api.delete(`/api/documents/${id}`)
    return data
  },
  async downloadDocument(id) {
    const response = await api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    })
    return response
  },
  async getDocument(id) {
    const { data } = await api.get(`/api/documents/${id}`)
    return data
  },
  async summarizeDocument(id) {
    const { data } = await api.post(`/api/documents/${id}/summarize`)
    return data
  },
}
