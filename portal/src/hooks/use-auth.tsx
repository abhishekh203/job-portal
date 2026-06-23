'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api, User, AuthResponse } from '@/lib/api'
import { toast } from 'sonner'
import { handleApiError, handleEmailVerificationError, isEmailVerificationError } from '@/lib/error-handler'

interface RegisterData {
  fullName: string
  email: string
  password: string
  phone?: string
  experienceLevel?: string
}

interface EmployerRegisterData {
  fullName: string
  email: string
  password: string
  phone?: string
  companyName: string
  companyDescription?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  loginWithCredentials: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  registerEmployer: (data: EmployerRegisterData) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  const login = (token: string, userData: User) => {
    api.setToken(token)
    setUser(userData)
    setLoading(false)
  }

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response: AuthResponse = await api.login(email, password)

      login(response.token, response.user)
      toast.success('Welcome back!')

      // Redirect based on role
      if (response.user.role === 'EMPLOYER') {
        router.push('/dashboard/employer')
      } else if (!response.user.profileCompleted) {
        router.push('/dashboard/profile?welcome=true')
      } else {
        router.push('/dashboard/profile')
      }
    } catch (error) {
      // Handle email verification errors specially
      if (isEmailVerificationError(error)) {
        handleEmailVerificationError(error, email)
      } else {
        handleApiError(error, 'Login failed')
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const response: any = await api.register(data)

      // Check if email verification is required
      if (response.requiresVerification) {
        toast.success('Account created! Please check your email to verify your account.')
        router.push('/auth/verify-email-sent?email=' + encodeURIComponent(data.email))
      } else {
        // Old flow - direct login (fallback)
        login(response.token, response.user)
        toast.success('Account created successfully!')
        router.push('/dashboard/profile?welcome=true')
      }
    } catch (error) {
      handleApiError(error, 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registerEmployer = async (data: EmployerRegisterData) => {
    try {
      setLoading(true)
      const response: any = await api.employerRegister(data)

      if (response.requiresVerification) {
        toast.success('Employer account created! Please check your email to verify your account.')
        router.push('/auth/verify-email-sent?email=' + encodeURIComponent(data.email))
      } else {
        login(response.token, response.user)
        toast.success('Employer account created successfully!')
        router.push('/dashboard/employer')
      }
    } catch (error) {
      handleApiError(error, 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      setLoading(true)
      await api.resendVerificationEmail(email)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      handleApiError(error, 'Failed to resend verification email')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    api.clearToken()
    setUser(null)
    setLoading(false)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const refreshUser = async () => {
    try {
      setLoading(true)
      const userData = await api.getProfile()
      setUser(userData)
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      // The API client reads the persisted token from storage on construction.
      const token = api.getToken()

      if (token) {
        try {
          setLoading(true)
          const userData = await api.getProfile()
          setUser(userData)
        } catch {
          api.clearToken()
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithCredentials,
    register,
    registerEmployer,
    resendVerificationEmail,
    logout,
    refreshUser,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [auth.loading, auth.isAuthenticated, router])

  return auth
}

// Hook for redirecting authenticated users
export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'EMPLOYER') {
        router.push('/dashboard/employer')
      } else {
        router.push('/dashboard/profile')
      }
    }
  }, [user, loading, router])

  return { user, loading }
}
