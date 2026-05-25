import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export const assetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const api = axios.create({
  baseURL: `${API_BASE}/api/admin`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
  transitional: {
    clarifyTimeoutError: true
  }
})

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
