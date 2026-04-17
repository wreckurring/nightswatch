import { create } from 'zustand'
import type { User } from '../types/auth'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

const storedUser = localStorage.getItem('nw_user')
const storedToken = localStorage.getItem('nw_token')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken ?? null,
  setAuth: (user, token) => {
    localStorage.setItem('nw_user', JSON.stringify(user))
    localStorage.setItem('nw_token', token)
    set({ user, token })
  },
  clearAuth: () => {
    localStorage.removeItem('nw_user')
    localStorage.removeItem('nw_token')
    set({ user: null, token: null })
  },
}))
