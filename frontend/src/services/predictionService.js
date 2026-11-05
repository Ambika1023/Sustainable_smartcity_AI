import api from './api'

export const predictionService = {
  async getPredictions(type, params = {}) {
    const { data } = await api.get(`/api/predictions/${type}`, { params })
    return data
  },
  async trainModel(type) {
    const { data } = await api.post(`/api/predictions/${type}/train`)
    return data
  },
  async getModelInfo(type) {
    const { data } = await api.get(`/api/predictions/${type}/model-info`)
    return data
  },
  async getAllModelStatuses() {
    const { data } = await api.get('/api/predictions/model-info')
    return data
  },
}
