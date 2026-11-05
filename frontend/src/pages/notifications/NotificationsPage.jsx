import { useState, useEffect } from 'react'
import {
  Bell, CheckCheck, Check, AlertTriangle, MessageSquare,
  TrendingDown, ShieldAlert, Radio, RefreshCw, Filter
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { notificationService } from '../../services/notificationService'
import { useNotifications } from '../../hooks/useNotifications'
import { formatRelativeTime, formatDateTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function NotificationsPage() {
  const { refreshUnread } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'unread') params.is_read = false
      if (filter === 'read') params.is_read = true
      const data = await notificationService.getNotifications(params)
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      if (refreshUnread) refreshUnread()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      if (refreshUnread) refreshUnread()
    } catch (err) {
      console.error(err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ANOMALY_DETECTED':
      case 'UNUSUAL_ENVIRONMENTAL_ACTIVITY':
        return <div className="p-2.5 rounded-lg bg-red-100 text-red-700"><AlertTriangle size={18} /></div>
      case 'NEW_HIGH_PRIORITY_COMPLAINT':
      case 'COMPLAINT_ESCALATION':
        return <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700"><MessageSquare size={18} /></div>
      case 'DEPARTMENT_PERFORMANCE_WARNING':
      case 'PREDICTION_WARNING':
        return <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700"><TrendingDown size={18} /></div>
      default:
        return <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700"><Radio size={18} /></div>
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Center</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Live operational alerts, telemetry anomaly warnings, and municipal dispatch notices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={loadNotifications}>
              Refresh
            </Button>
            <Button variant="primary" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filter === tab
                  ? 'bg-navy-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Notifications"
              description="You have no notifications or alerts under this filter."
            />
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  notif.is_read
                    ? 'bg-white border-gray-200/80 shadow-sm opacity-80'
                    : 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {getNotificationIcon(notif.notification_type)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${notif.is_read ? 'text-gray-800' : 'text-gray-900 font-bold'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                      <span>{formatRelativeTime(notif.created_at)}</span>
                      <span>·</span>
                      <span>{formatDateTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                    title="Mark as Read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

