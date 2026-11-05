import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/authService'

export default function SetupSuperAdmin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ setup_secret: '', full_name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    authService.checkSetupStatus().then(d => {
      if (d.super_admin_exists) navigate('/login')
    }).catch(() => {}).finally(() => setChecking(false))
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authService.setupSuperAdmin({
        setup_secret: form.setup_secret,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      })
      navigate('/login', { state: { message: 'Super Admin created. Please login.' } })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="text-white">Checking setup status...</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Initial Portal Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Create the Super Administrator account</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex gap-2">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold text-sm">Security Notice</p>
              <p className="text-amber-700 text-xs mt-0.5">This page should be disabled after the initial setup. Configure SUPER_ADMIN_SETUP_ENABLED=false in your .env file.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Setup Secret Key', key: 'setup_secret', type: 'password', placeholder: 'From your .env file' },
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Super Administrator' },
              { label: 'Official Email', key: 'email', type: 'email', placeholder: 'admin@smartcity.gov' },
              { label: 'Password', key: 'password', type: showPwd ? 'text' : 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', key: 'confirm', type: showPwd ? 'text' : 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Super Admin Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

