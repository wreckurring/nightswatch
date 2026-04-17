import axios from 'axios'

// Empty VITE_API_URL = use relative paths (Vite proxy handles it in dev)
const BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nw_token')
      localStorage.removeItem('nw_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
