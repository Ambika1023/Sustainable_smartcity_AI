import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, AlertTriangle, ShieldAlert, CheckCircle, Clock,
  MapPin, Cpu, FileText, Send, AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { anomalyService } from '../../services/anomalyService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatDateTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

export default function AnomalyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()

  const [anomaly, setAnomaly] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const canUpdate = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await anomalyService.getAnomaly(id)
      setAnomaly(data)
      setStatus(data.status)
      setNotes(data.resolution_notes || '')
    } catch (err) {
      console.error('Failed to load anomaly', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg('')
    try {
      await anomalyService.updateAnomalyStatus(id, {
        status,
        resolution_notes: notes,
      })
      setSuccessMsg('Investigation status and remarks updated successfully.')
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to update anomaly status')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-4xl mx-auto">
          <LoadingSkeleton variant="card" />
        </div>
      </DashboardLayout>
    )
  }

  if (!anomaly) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center max-w-md mx-auto mt-12">
          <AlertCircle className="mx-auto text-amber-500 mb-2" size={36} />
          <h2 className="text-lg font-bold text-gray-800">Anomaly Record Not Found</h2>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/anomalies')}>
            Back to Anomalies
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/anomalies"
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {anomaly.anomaly_number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                  {anomaly.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  anomaly.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  anomaly.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  anomaly.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {anomaly.severity} Severity
                </span>
                {anomaly.is_ml_detected && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                    <Cpu size={11} /> ML Isolation Forest
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{anomaly.description}</h1>
            </div>
          </div>
        </div>

        {/* Telemetry Comparison Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Telemetry Outlier Deviation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50/70 border border-red-100 p-4 rounded-xl">
              <span className="text-xs text-red-700 font-medium block">Observed Metric Value</span>
              <span className="text-2xl font-extrabold text-red-700 mt-1 block">
                {Number(anomaly.observed_value).toLocaleString()}
              </span>
              <span className="text-[11px] text-red-500">Exceeded normal bounds</span>
            </div>
            <div className="bg-green-50/70 border border-green-100 p-4 rounded-xl">
              <span className="text-xs text-green-700 font-medium block">Expected Normal Minimum</span>
              <span className="text-2xl font-bold text-green-800 mt-1 block">
                {Number(anomaly.expected_min).toLocaleString()}
              </span>
              <span className="text-[11px] text-green-600">Lower baseline percentile</span>
            </div>
            <div className="bg-green-50/70 border border-green-100 p-4 rounded-xl">
              <span className="text-xs text-green-700 font-medium block">Expected Normal Maximum</span>
              <span className="text-2xl font-bold text-green-800 mt-1 block">
                {Number(anomaly.expected_max).toLocaleString()}
              </span>
              <span className="text-[11px] text-green-600">Upper baseline percentile</span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
            <div>
              <span className="text-gray-400 block">Detection Timestamp</span>
              <span className="font-medium text-gray-800">{formatDateTime(anomaly.detected_at)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Location / Ward</span>
              <span className="font-medium text-gray-800">{anomaly.location || 'Ward Telemetry Sensor'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Isolation Anomaly Score</span>
              <span className="font-mono text-purple-700 font-bold">{anomaly.anomaly_score?.toFixed(4) || '—'}</span>
            </div>
          </div>
        </div>

        {/* Investigation & Action Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-navy-900" />
            Official Investigation & Verification
          </h2>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Investigation Status *</label>
              <select
                disabled={!canUpdate}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              >
                <option value="NEW">NEW - Unreviewed</option>
                <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION - Inspection Dispatched</option>
                <option value="VERIFIED">VERIFIED - Physical Incident Confirmed</option>
                <option value="RESOLVED">RESOLVED - Remediation Complete</option>
                <option value="FALSE_POSITIVE">FALSE_POSITIVE - Sensor Malfunction / Normal Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Investigation Notes & Action Log</label>
              <textarea
                disabled={!canUpdate}
                rows={4}
                placeholder="Log physical field verification details, cause of surge/drop, or maintenance tickets created..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            {canUpdate && (
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={submitting} icon={Send}>
                  Save Investigation Status
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

