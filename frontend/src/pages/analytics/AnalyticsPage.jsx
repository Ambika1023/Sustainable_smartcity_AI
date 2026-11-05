import { useState, useEffect } from 'react'
import {
  BarChart3, Download, RefreshCw, Calendar, MapPin, Database,
  Droplets, Zap, Trash2, Wind, Car, Trees, AlertCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout'
import { analyticsService } from '../../services/analyticsService'
import { useAuth } from '../../hooks/useAuth'
import { WARDS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

export default function AnalyticsPage() {
  const { user, hasAnyRole } = useAuth()
  const [period, setPeriod] = useState('monthly')
  const [wardId, setWardId] = useState('')
  const [envData, setEnvData] = useState([])
  const [deptPerf, setDeptPerf] = useState([])
  const [wardDist, setWardDist] = useState([])
  const [sustainabilityScore, setSustainabilityScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [exporting, setExporting] = useState(false)

  const canExport = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'])
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [envRes, deptRes, wardRes, scoreRes] = await Promise.all([
        analyticsService.getEnvironmentalData(period, wardId || undefined),
        analyticsService.getDepartmentPerformance(),
        analyticsService.getWardDistribution(),
        analyticsService.getSustainabilityScore(),
      ])
      setEnvData(envRes || [])
      setDeptPerf(deptRes || [])
      setWardDist(wardRes || [])
      setSustainabilityScore(scoreRes?.sustainability_score ?? 0)
    } catch (err) {
      console.error('Failed to load analytics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [period, wardId])

  const handleSeedData = async () => {
    if (!window.confirm('Seed database with 365 days of realistic sample environmental data?')) return
    setSeeding(true)
    try {
      await analyticsService.seedSampleData()
      alert('Sample environmental analytics data seeded successfully!')
      loadAnalytics()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to seed sample data')
    } finally {
      setSeeding(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await analyticsService.exportCSV({ metric: 'environmental' })
      const blob = new Blob([response.data || response], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartcity_environmental_data_${period}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      alert('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Smart City Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Comprehensive telemetry on urban resources, power, water, air quality, and municipal throughput.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button
                variant="secondary"
                icon={Database}
                loading={seeding}
                onClick={handleSeedData}
              >
                Seed Sample Telemetry
              </Button>
            )}

            {canExport && (
              <Button
                variant="secondary"
                icon={Download}
                loading={exporting}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            )}

            <Button variant="primary" icon={RefreshCw} onClick={loadAnalytics}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Controls & Sustainability Score Badge */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Period buttons */}
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                    period === p ? 'bg-white text-navy-900 font-bold shadow-sm' : 'hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Ward selector */}
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="">City-Wide (All Wards)</option>
              {WARDS.filter(w => w.value).map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>

          {/* Sustainability Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Urban Sustainability Index:</span>
            <span className={`text-sm px-2.5 py-1 rounded-full font-bold ${
              (sustainabilityScore || 0) >= 70 ? 'bg-emerald-100 text-emerald-800' :
              (sustainabilityScore || 0) >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {sustainabilityScore !== null ? `${sustainabilityScore} / 100` : '—'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
          </div>
        ) : (
          <>
            {/* Telemetry Charts Grid (4 Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Water Consumption Chart */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                    <Droplets size={18} />
                    <span>Water Consumption (Liters)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={envData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [Number(v).toLocaleString() + ' L', 'Water']} />
                    <Area type="monotone" dataKey="water_consumption_liters" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Electricity Consumption Chart */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                    <Zap size={18} />
                    <span>Electricity Consumption (kWh)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={envData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [Number(v).toLocaleString() + ' kWh', 'Power']} />
                    <Area type="monotone" dataKey="electricity_consumption_kwh" stroke="#d97706" fill="#fde68a" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Waste Generation & Air Quality Index */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <Trash2 size={18} className="text-stone-600" />
                    <span>Solid Waste Generation (kg)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={envData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [Number(v).toLocaleString() + ' kg', 'Waste']} />
                    <Bar dataKey="waste_generation_kg" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Air Quality Index (AQI) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <Wind size={18} />
                    <span>Air Quality Index (AQI)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={envData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, 'AQI']} />
                    <Line type="monotone" dataKey="air_quality_index" stroke="#059669" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Performance & Ward Complaint Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Resolution Throughput */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Department Resolution Throughput</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deptPerf} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="department" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ward-wise Complaint Distribution */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Ward-wise Citizen Complaints</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={wardDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="ward" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, 'Complaints']} />
                    <Bar dataKey="count" name="Complaints" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

