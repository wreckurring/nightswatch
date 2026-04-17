import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import type { LoginPayload, RegisterPayload } from '../types/auth'

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload)
    setAuth({ username: res.username, email: res.email, role: res.role }, res.token)
    return res
  }

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload)
    setAuth({ username: res.username, email: res.email, role: res.role }, res.token)
    return res
  }

  const logout = () => clearAuth()

  return { user, token, login, register, logout, isAuthenticated: !!token }
}
