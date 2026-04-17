import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToastStore } from '../../store/toastStore'

export function RegisterForm() {
  const { register } = useAuth()
  const push = useToastStore((s) => s.push)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed'
      setErrors({ general: msg })
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
        minLength={3}
        maxLength={32}
        required
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        autoComplete="new-password"
        minLength={8}
        required
        error={errors.general}
      />
      <Button type="submit" loading={loading} className="w-full mt-1">
        Create Account
      </Button>
    </motion.form>
  )
}
