import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, Building, ShieldCheck,
  Calendar, Clock, UserCheck, UserX, AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userService } from '../../services/userService'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatDateTime, getInitials } from '../../utils/formatters'
import { getRoleDisplayName, getRoleColor } from '../../utils/rolePermissions'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [official, setOfficial] = useState(null)
  const [department, setDepartment] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const u = await userService.getUser(id)
      setOfficial(u)
      if (u.department_id) {
        try {
          const d = await departmentService.getDepartment(u.department_id)
          setDepartment(d)
        } catch {
          setDepartment(null)
        }
      }
    } catch (err) {
      console.error('Failed to load user', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleToggleActive = async () => {
    const action = official.is_active ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return
    try {
      if (official.is_active) {
        await userService.deactivateUser(official.id)
      } else {
        await userService.activateUser(official.id)
      }
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || `Failed to ${action} user`)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <LoadingSkeleton variant="card" />
        </div>
      </DashboardLayout>
    )
  }

  if (!official) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center max-w-md mx-auto mt-12">
          <AlertCircle className="mx-auto text-amber-500 mb-2" size={36} />
          <h2 className="text-lg font-bold text-gray-800">Official Account Not Found</h2>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/users')}>
            Back to User Directory
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const isSelf = official.id === currentUser?.id

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/users"
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Official Account Profile</h1>
          </div>

          {!isSelf && (
            <Button
              variant={official.is_active ? 'danger' : 'success'}
              icon={official.is_active ? UserX : UserCheck}
              onClick={handleToggleActive}
            >
              {official.is_active ? 'Deactivate Account' : 'Activate Account'}
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-navy-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md">
              {getInitials(official.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">{official.full_name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(official.role)}`}>
                  {getRoleDisplayName(official.role)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  official.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {official.is_active ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{official.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-xl space-y-1">
              <span className="text-gray-400 font-medium block">Department Assignment</span>
              <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Building size={15} className="text-gray-500" />
                {department ? department.name : 'Global Administration'}
              </span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl space-y-1">
              <span className="text-gray-400 font-medium block">Official Phone</span>
              <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Phone size={15} className="text-gray-500" />
                {official.phone || 'Not recorded'}
              </span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl space-y-1">
              <span className="text-gray-400 font-medium block">Account Created On</span>
              <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-500" />
                {formatDate(official.created_at)}
              </span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl space-y-1">
              <span className="text-gray-400 font-medium block">Last Active Session</span>
              <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Clock size={15} className="text-gray-500" />
                {official.last_login ? formatDateTime(official.last_login) : 'Never logged in'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

