import { useState } from 'react'
import {
  User, Mail, Phone, Lock, Building, ShieldCheck,
  CheckCircle, AlertCircle, Save, KeyRound
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { formatDate, formatDateTime, getInitials } from '../../utils/formatters'
import { getRoleDisplayName, getRoleColor } from '../../utils/rolePermissions'
import Button from '../../components/ui/Button'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // Change Password State
  const [pwdForm, setPwdForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdError, setPwdError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwdSuccess('')
    setPwdError('')

    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError('New passwords do not match.')
      return
    }
    if (pwdForm.new_password.length < 8) {
      setPwdError('New password must be at least 8 characters.')
      return
    }

    setPwdLoading(true)
    try {
      await authService.changePassword(pwdForm.old_password, pwdForm.new_password)
      setPwdSuccess('Your password has been changed successfully.')
      setPwdForm({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      setPwdError(err?.response?.data?.detail || 'Failed to change password')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Government Official Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your credentials, security settings, and official municipal authorization details.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                {getInitials(user?.full_name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(user?.role)}`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-400 space-y-1">
              <div>Member Since: {formatDate(user?.created_at)}</div>
              <div>Last Login: {user?.last_login ? formatDateTime(user?.last_login) : 'Active Session'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account & Role Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck size={18} className="text-blue-600" />
              Official Authorization Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Authorized Role</span>
                <span className="font-semibold text-gray-800 text-sm">{getRoleDisplayName(user?.role)}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Department Jurisdiction</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {user?.department?.name || 'Global Municipal Jurisdiction'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Official Contact Phone</span>
                <span className="font-semibold text-gray-800 text-sm">{user?.phone || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Account Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 mt-0.5">
                  Verified Active Official
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <KeyRound size={18} className="text-forest-600" />
              Security & Credentials
            </h3>

            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle size={16} /> {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={16} /> {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={pwdForm.old_password}
                  onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={pwdForm.new_password}
                  onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={pwdForm.confirm_password}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" loading={pwdLoading} icon={Save}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

