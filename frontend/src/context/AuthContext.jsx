import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  // On mount, validate stored token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
          setToken(storedToken)
        } catch (err) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)
    const { access_token, user: userData } = data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
    navigate('/dashboard')
    return data
  }, [navigate])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const { access_token, user: userData } = data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
    navigate('/dashboard')
    return data
  }, [navigate])

  const logout = useCallback(async () => {
    await authService.logout()
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  const hasRole = useCallback((role) => {
    return user?.role === role
  }, [user])

  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role)
  }, [user])

  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      register,
      login,
      logout,
      hasRole,
      hasAnyRole,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
