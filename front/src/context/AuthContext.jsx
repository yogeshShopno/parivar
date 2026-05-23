import React, { createContext, useState, useCallback, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (stored) {
      setToken(stored)
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    const res = await fetch(`${apiBase}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Login failed')
    }

    const json = await res.json()
    const payload = json.data || json // Support nested {data: {token, user}} and flat responses
    
    const { token: receivedToken, user: receivedUser } = payload
    
    if (!receivedToken || !receivedUser) {
      throw new Error('Invalid login response from server')
    }

    setToken(receivedToken)
    setUser(receivedUser)
    localStorage.setItem('auth_token', receivedToken)
    localStorage.setItem('auth_user', JSON.stringify(receivedUser))
    return { token: receivedToken, user: receivedUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
