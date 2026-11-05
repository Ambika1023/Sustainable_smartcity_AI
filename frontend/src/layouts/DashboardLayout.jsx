import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavBar from './TopNavBar'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/complaints': 'Complaint Management',
  '/departments': 'Department Management',
  '/analytics': 'City Analytics',
  '/predictions': 'City Performance Predictions',
  '/anomalies': 'Urban Anomaly Detection',
  '/recommendations': 'Sustainability Recommendations',
  '/documents': 'Government Documents',
  '/notifications': 'Notification Center',
  '/users': 'User Management',
  '/profile': 'My Profile',
}

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Smart City Portal'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
        <TopNavBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

