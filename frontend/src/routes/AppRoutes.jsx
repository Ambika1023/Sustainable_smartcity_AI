import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ProtectedRoute from './ProtectedRoute'
import RoleGuard from './RoleGuard'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import SetupSuperAdmin from '../pages/auth/SetupSuperAdmin'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import Unauthorized from '../pages/auth/Unauthorized'

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage'

// Complaints
import ComplaintsPage from '../pages/complaints/ComplaintsPage'
import ComplaintDetailPage from '../pages/complaints/ComplaintDetailPage'

// Departments
import DepartmentsPage from '../pages/departments/DepartmentsPage'
import DepartmentDetailPage from '../pages/departments/DepartmentDetailPage'

// Analytics
import AnalyticsPage from '../pages/analytics/AnalyticsPage'

// Predictions
import PredictionsPage from '../pages/predictions/PredictionsPage'

// Anomalies
import AnomaliesPage from '../pages/anomalies/AnomaliesPage'
import AnomalyDetailPage from '../pages/anomalies/AnomalyDetailPage'

// Recommendations
import RecommendationsPage from '../pages/recommendations/RecommendationsPage'

// Documents
import DocumentsPage from '../pages/documents/DocumentsPage'

// Notifications
import NotificationsPage from '../pages/notifications/NotificationsPage'

// Users
import UsersPage from '../pages/users/UsersPage'
import UserDetailPage from '../pages/users/UserDetailPage'

// Profile
import ProfilePage from '../pages/profile/ProfilePage'

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/setup" element={<SetupSuperAdmin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'CITY_ADMIN', 'DEPARTMENT_OFFICER', 'DATA_ANALYST']}>
              <DepartmentsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route path="/departments/:id" element={<ProtectedRoute><DepartmentDetailPage /></ProtectedRoute>} />

      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

      <Route
        path="/predictions"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST']}>
              <PredictionsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route path="/anomalies" element={<ProtectedRoute><AnomaliesPage /></ProtectedRoute>} />
      <Route path="/anomalies/:id" element={<ProtectedRoute><AnomalyDetailPage /></ProtectedRoute>} />

      <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />

      <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <UsersPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <UserDetailPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
