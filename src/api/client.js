import axios from 'axios'

const api = axios.create({ baseURL: 'http://127.0.0.1:8000' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const register           = (data)         => api.post('/auth/register', data)
export const login              = (data)         => api.post('/auth/login', data)
export const getLatestAnalytics = ()             => api.get('/analytics/latest')
export const getTrends          = (filter='6weeks') => api.get(`/analytics/trends?range_filter=${filter}`)
export const getMonthly         = ()             => api.get('/analytics/monthly')
export const getQuarterly       = ()             => api.get('/analytics/quarterly')
export const getReports         = ()             => api.get('/reports')
export const getInsights        = (filter='6weeks') => api.get(`/insights?range_filter=${filter}`)
export const uploadSQP          = (file)         => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload/sqp', fd)
}

export default api