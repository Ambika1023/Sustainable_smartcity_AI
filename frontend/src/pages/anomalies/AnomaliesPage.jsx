import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, RefreshCw, Play, Filter, Eye, CheckCircle,
  Clock, ShieldAlert, AlertCircle, MapPin
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { anomalyService } from '../../services/anomalyService'
import { useAuth } from '../../hooks/useAuth'
import {
  ANOMALY_SEVERITIES, ANOMALY_STATUSES
} from '../../utils/constants'
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

export default function AnomaliesPage() {
  const { hasAnyRole } = useAuth()
  const [anomalies, setAnomalies] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [detectResult, setDetectResult] = useState('')

  // Filters
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')

  const canRunDetection = hasAnyRole(['SUPER_ADMIN', 'DATA_ANALYST'])

  const loadAnomalies = async () => {
    setLoading(true)
    try {
      const data = await anomalyService.getAnomalies({
        page,
        per_page: 15,
        ...(status && { status }),
        ...(category && { category }),
        ...(severity && { severity }),
      })
      setAnomalies(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      console.error('Failed to load anomalies', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnomalies()
  }, [page, status, category, severity])

  const handleRunDetection = async () => {
    setDetecting(true)
    setDetectResult('')
    try {
      const res = await anomalyService.detectAnomalies()
      setDetectResult(res.message || 'Detection run successfully.')
      loadAnomalies()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to run anomaly detection')
    } finally {
      setDetecting(false)
    }
  }

  const getSeverityBadge = (sev) => {
    const colorClasses = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200 font-bold',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200 font-semibold',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${colorClasses[sev] || colorClasses.LOW}`}>
        {sev}
      </span>
    )
  }

  const getStatusBadge = (st) => {
    const colorClasses = {
      NEW: 'bg-blue-100 text-blue-700',
      UNDER_INVESTIGATION: 'bg-purple-100 text-purple-700',
      VERIFIED: 'bg-amber-100 text-amber-700',
      RESOLVED: 'bg-emerald-100 text-emerald-700',
      FALSE_POSITIVE: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[st] || 'bg-gray-100 text-gray-700'}`}>
        {(st || '').replace('_', ' ')}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Urban Anomaly Detection</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Unsupervised machine learning outlier detection using Scikit-learn Isolation Forest on municipal utilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canRunDetection && (
              <Button
                variant="primary"
                icon={Play}
                loading={detecting}
                onClick={handleRunDetection}
              >
                Run ML Anomaly Detector
              </Button>
            )}
            <Button variant="secondary" icon={RefreshCw} onClick={loadAnomalies}>
              Refresh
            </Button>
          </div>
        </div>

        {detectResult && (
          <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle size={18} className="text-blue-600" />
            <span>{detectResult}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>

          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Categories</option>
            <option value="Water Consumption">Water Consumption</option>
            <option value="Electricity Usage">Electricity Usage</option>
            <option value="Waste Generation">Waste Generation</option>
            <option value="Air Quality">Air Quality</option>
            <option value="Complaint Volume">Complaint Volume</option>
          </select>

          {(status || severity || category) && (
            <button
              onClick={() => { setStatus(''); setSeverity(''); setCategory(''); setPage(1); }}
              className="text-xs text-navy-800 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Anomalies Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table-row" count={5} />
            </div>
          ) : anomalies.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No Anomalies Flagged"
              description="No unusual deviations detected under selected criteria. The city utilities are operating within expected ranges."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                    <th className="py-3 px-4">Anomaly ID</th>
                    <th className="py-3 px-4">Telemetry Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Observed vs Expected</th>
                    <th className="py-3 px-4">Detection Date</th>
                    <th className="py-3 px-4">Investigation Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {anomalies.map((anm) => (
                    <tr key={anm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-xs text-blue-700">
                        {anm.anomaly_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800 text-xs">{anm.category}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{anm.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getSeverityBadge(anm.severity)}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold text-red-600">{Number(anm.observed_value).toLocaleString()}</span>
                        <span className="text-gray-400 block text-[10px]">
                          Expected: {Number(anm.expected_min).toLocaleString()} - {Number(anm.expected_max).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        <div>{formatDate(anm.detected_at)}</div>
                        <div className="text-[10px] text-gray-400">{formatRelativeTime(anm.detected_at)}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(anm.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/anomalies/${anm.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-navy-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Eye size={13} /> Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && anomalies.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                perPage={15}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

