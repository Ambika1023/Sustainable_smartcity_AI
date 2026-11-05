import api from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('/api/auth/register', payload)
    return data // { access_token, token_type, user }
  },
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    return data // { access_token, token_type, user }
  },
  async getMe() {
    const { data } = await api.get('/api/auth/me')
    return data
  },
  async logout() {
    try {
      await api.post('/api/auth/logout')
    } catch (e) {
      // ignore logout errors
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  async forgotPassword(email) {
    const { data } = await api.post('/api/auth/forgot-password', { email })
    return data
  },
  async resetPassword(token, new_password) {
    const { data } = await api.post('/api/auth/reset-password', { token, new_password })
    return data
  },
  async changePassword(old_password, new_password) {
    const { data } = await api.post('/api/auth/change-password', { old_password, new_password })
    return data
  },
  async setupSuperAdmin(payload) {
    const { data } = await api.post('/api/auth/setup-super-admin', payload)
    return data
  },
  async checkSetupStatus() {
    const { data } = await api.get('/api/setup/status')
    return data
  },
  async updateProfile(payload) {
    const { data } = await api.put('/api/auth/profile', payload)
    return data
  },
}
