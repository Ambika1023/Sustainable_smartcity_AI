import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { notificationService } from '../services/notificationService'
import { AuthContext } from './AuthContext'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const auth = useContext(AuthContext)

  const refreshNotifications = useCallback(async () => {
    if (!auth?.isAuthenticated) return
    try {
      const data = await notificationService.getUnreadCount()
      setUnreadCount(data?.count ?? data?.unread_count ?? 0)
    } catch (err) {
      // silently fail
    }
  }, [auth?.isAuthenticated])

  // Poll every 60 seconds when authenticated
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      setUnreadCount(0)
      return
    }
    refreshNotifications()
    const interval = setInterval(refreshNotifications, 60000)
    return () => clearInterval(interval)
  }, [auth?.isAuthenticated, refreshNotifications])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}
