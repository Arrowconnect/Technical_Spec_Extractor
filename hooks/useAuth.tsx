'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastActivityMs, setLastActivityMs] = useState<number>(Date.now())
  const INACTIVITY_LIMIT_MS = 20 * 60 * 1000 // 20 minutes

  // On load, do NOT auto-login. Also clear any leftover cookies to enforce login on refresh.
  useEffect(() => {
    const token = Cookies.get('auth-token')
    if (token) Cookies.remove('auth-token')
    setIsLoading(false)
  }, [])

  // Track user activity and enforce 20-minute inactivity logout
  useEffect(() => {
    const updateActivity = () => setLastActivityMs(Date.now())
    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart'
    ]
    activityEvents.forEach((evt) => window.addEventListener(evt, updateActivity))

    const checkInterval = setInterval(() => {
      if (user && Date.now() - lastActivityMs > INACTIVITY_LIMIT_MS) {
        logout()
      }
    }, 60 * 1000) // check every minute

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, updateActivity))
      clearInterval(checkInterval)
    }
  }, [user, lastActivityMs])

  const login = (token: string, userData: User) => {
    // Do not persist auth; refreshing the page should require login again
    setUser(userData)
    setLastActivityMs(Date.now())
  }

  const logout = () => {
    Cookies.remove('auth-token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isLoading
  }

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    props.children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}