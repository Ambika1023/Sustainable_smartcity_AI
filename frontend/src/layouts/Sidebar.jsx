import { Building2, LayoutDashboard, MessageSquare, Building, BarChart3, TrendingUp, AlertTriangle, Lightbulb, FileText, Bell, Users, LogOut, ChevronRight } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { getRoleDisplayName, getRoleColor } from '../utils/rolePermissions'

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'CITIZEN SERVICES',
    items: [
      { to: '/complaints', icon: MessageSquare, label: 'Complaints' },
      { to: '/departments', icon: Building, label: 'Departments' },
    ],
  },
  {
    label: 'CITY INTELLIGENCE',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/predictions', icon: TrendingUp, label: 'Predictions', roles: ['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'] },
      { to: '/anomalies', icon: AlertTriangle, label: 'Anomaly Detection' },
      { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { to: '/documents', icon: FileText, label: 'Documents' },
      { to: '/notifications', icon: Bell, label: 'Notifications', showBadge: true },
    ],
  },
]

const adminSection = {
  label: 'ADMINISTRATION',
  items: [
    { to: '/users', icon: Users, label: 'User Management', roles: ['SUPER_ADMIN'] },
  ],
}

export default function Sidebar() {
  const { user, logout, hasAnyRole } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  const allSections = [...navSections]
  if (user?.role === 'SUPER_ADMIN') {
    allSections.push(adminSection)
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-800">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 size={22} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">Smart City</div>
          <div className="text-blue-300 text-xs">Gov Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {allSections.map((section) => {
          const visibleItems = section.items.filter(item =>
            !item.roles || hasAnyRole(item.roles)
          )
          if (!visibleItems.length) return null
          return (
            <div key={section.label}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(({ to, icon: Icon, label, showBadge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {showBadge && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-slate-800 p-3">
        <div
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          onClick={() => navigate('/profile')}
        >
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.full_name}</div>
            <div className="text-slate-400 text-xs truncate">{getRoleDisplayName(user?.role)}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

