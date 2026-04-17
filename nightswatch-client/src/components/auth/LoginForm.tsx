import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToastStore } from '../../store/toastStore'

export function LoginForm() {
  const { login } = useAuth()
  const push = useToastStore((s) => s.push)
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid credentials'
      setError(msg)
      push(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <Input
        label="Username"
        placeholder="your_username"
        value={form.username}
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        autoComplete="username"
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        autoComplete="current-password"
        required
        error={error}
      />
      <Button type="submit" loading={loading} className="w-full mt-1">
        Sign In
      </Button>
    </motion.form>
  )
}
