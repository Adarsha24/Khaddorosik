'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getToken, setTokens, clearTokens } from '@/lib/api'

export interface Restaurant {
  id: string
  name: string
  logo?: string
  taxRate: number
  cgstRate: number
  sgstRate: number
  gstNumber?: string
  currency: string
  address?: string
  phone?: string
}

export interface AuthUser {
  id: string
  email: string
  role: string
  restaurantId: string
  name: string
  restaurant: Restaurant
}

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithOtp: (email: string, code: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  login: async () => {}, loginWithOtp: async () => {}, logout: async () => {}, refreshUser: async () => {},
})

async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Session expired')
  const { data } = await res.json()
  return {
    id: data.id, email: data.email, role: data.role,
    restaurantId: data.restaurantId, name: data.name ?? data.email,
    restaurant: data.restaurant,
  }
}

async function doLogin(email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Login failed')
  setTokens(json.data.accessToken, json.data.refreshToken)
  return {
    id: json.data.user.id, email: json.data.user.email, role: json.data.user.role,
    restaurantId: json.data.user.restaurantId, name: json.data.user.name,
    restaurant: json.data.user.restaurant,
  }
}

async function doOtpLogin(email: string, code: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/otp/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Invalid OTP')
  setTokens(json.data.accessToken, json.data.refreshToken)
  return {
    id: json.data.user.id, email: json.data.user.email, role: json.data.user.role,
    restaurantId: json.data.user.restaurantId, name: json.data.user.name,
    restaurant: json.data.user.restaurant,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) { setUser(null); return }
    try {
      const u = await fetchMe(token)
      setUser(u)
    } catch {
      clearTokens()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const u = await doLogin(email, password)
    setUser(u)
  }, [])

  const loginWithOtp = useCallback(async (email: string, code: string) => {
    const u = await doOtpLogin(email, code)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    const token = getToken()
    if (token) {
      const rt = localStorage.getItem('__rt')
      await fetch('/api/auth/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {})
    }
    clearTokens()
    setUser(null)
  }, [])

  return <Ctx.Provider value={{ user, loading, login, loginWithOtp, logout, refreshUser }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
