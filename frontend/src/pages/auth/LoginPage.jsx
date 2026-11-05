import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Building2, AlertCircle, Phone,
  Briefcase, CheckCircle2, ArrowRight, LogIn
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { departmentService } from '../../services/departmentService'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // Tab mode: 'login' | 'register'
  const [mode, setMode] = useState('login')

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Register form
  const [regForm, setRegForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'DEPARTMENT_OFFICER',
    department_id: '',
  })
  const [departments, setDepartments] = useState([])
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  // Default fallback departments in case network is delayed
  const DEFAULT_DEPARTMENTS = [
    { id: 'water-dept', name: 'Water Supply' },
    { id: 'waste-dept', name: 'Waste Management' },
    { id: 'elec-dept', name: 'Electricity' },
    { id: 'roads-dept', name: 'Road and Infrastructure' },
    { id: 'traffic-dept', name: 'Traffic Management' },
    { id: 'env-dept', name: 'Environmental Protection' },
    { id: 'health-dept', name: 'Public Health and Sanitation' },
  ]

  useEffect(() => {
    departmentService.getDepartments()
      .then(d => {
        if (d && d.length > 0) setDepartments(d)
        else setDepartments(DEFAULT_DEPARTMENTS)
      })
      .catch(() => setDepartments(DEFAULT_DEPARTMENTS))
  }, [])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill in all fields.')
      return
    }
    setLoginLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
    } catch (err) {
      setLoginError(err?.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegError('')

    if (!regForm.full_name || !regForm.email || !regForm.password) {
      setRegError('Please fill in all mandatory fields.')
      return
    }

    if (regForm.password.length < 8) {
      setRegError('Password must be at least 8 characters long.')
      return
    }

    if (regForm.password !== regForm.confirm_password) {
      setRegError('Passwords do not match.')
      return
    }

    setRegLoading(true)
    try {
      await register({
        full_name: regForm.full_name,
        email: regForm.email,
        password: regForm.password,
        phone: regForm.phone || undefined,
        role: regForm.role,
        department_id: regForm.department_id || undefined,
      })
    } catch (err) {
      setRegError(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 py-8">
      <div className={`w-full transition-all duration-300 ${mode === 'register' ? 'max-w-lg' : 'max-w-md'}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-900/50">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart City Gov Portal</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            Official Government Access Only
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-xs text-gray-500 mt-0.5">Enter your official credentials to sign in</p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Official Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="name@smartcity.gov"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showLoginPwd ? 'text' : 'password'}
                      required
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd(!showLoginPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-md transition text-sm mt-2"
                >
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                  {!loginLoading && <LogIn size={16} />}
                </button>
              </form>

              {/* Link to Register */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  New User?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              </div>

              {/* Quick autofill demo accounts */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-2">Quick Demo Accounts (Click to autofill):</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'super_admin@smartcity.gov', password: 'Admin@123456' })}
                    className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 text-left transition"
                  >
                    <div className="font-medium">👑 Super Admin</div>
                    <div className="text-[10px] text-blue-500 truncate">super_admin@smartcity.gov</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'city_admin@smartcity.gov', password: 'CityAdmin@123' })}
                    className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 text-left transition"
                  >
                    <div className="font-medium">🏛️ City Admin</div>
                    <div className="text-[10px] text-indigo-500 truncate">city_admin@smartcity.gov</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'officer@smartcity.gov', password: 'Officer@123' })}
                    className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 text-left transition"
                  >
                    <div className="font-medium">👷 Dept Officer</div>
                    <div className="text-[10px] text-emerald-500 truncate">officer@smartcity.gov</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'analyst@smartcity.gov', password: 'Analyst@123' })}
                    className="p-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-200 text-left transition"
                  >
                    <div className="font-medium">📊 Data Analyst</div>
                    <div className="text-[10px] text-amber-500 truncate">analyst@smartcity.gov</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-800">Personnel Registration</h2>
                <p className="text-xs text-gray-500 mt-0.5">Create your official government portal account</p>
              </div>

              {regError && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regForm.full_name}
                      onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="e.g. Officer Vikram Sharma"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Official Email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="name@smartcity.gov"
                        className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={regForm.phone}
                        onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Portal Role *</label>
                    <select
                      value={regForm.role}
                      onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="DEPARTMENT_OFFICER">Department Officer</option>
                      <option value="CITY_ADMIN">City Administrator</option>
                      <option value="DATA_ANALYST">Data Analyst</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department Assignment *
                    </label>
                    <select
                      required
                      value={regForm.department_id}
                      onChange={e => setRegForm(f => ({ ...f, department_id: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-gray-800"
                    >
                      <option value="">-- Select Municipal Department --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password (min 8 chars) *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        required
                        value={regForm.password}
                        onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd(!showRegPwd)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        required
                        value={regForm.confirm_password}
                        onChange={e => setRegForm(f => ({ ...f, confirm_password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-3">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
                  >
                    {regLoading ? 'Registering Account...' : 'Register Official Account'}
                    {!regLoading && <ArrowRight size={18} />}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Sustainable Smart City AI Assistant • Official Government Portal
        </p>
      </div>
    </div>
  )
}
