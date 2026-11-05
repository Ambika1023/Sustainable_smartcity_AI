import { useState, useEffect } from 'react'
import {
  Lightbulb, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight,
  ShieldCheck, Check, X, RefreshCw, AlertCircle, FileText, Sparkles
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { recommendationService } from '../../services/recommendationService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function RecommendationsPage() {
  const { hasAnyRole } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    affected_area: '',
    problem_description: '',
    suggested_actions_text: '',
    priority: 'HIGH',
    expected_impact: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // Status Change State
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  const canManage = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN'])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const data = await recommendationService.getRecommendations({
        ...(priority && { priority }),
        ...(status && { status }),
      })
      setRecommendations(data || [])
    } catch (err) {
      console.error('Failed to load recommendations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [priority, status])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!createForm.title || !createForm.affected_area || !createForm.problem_description) {
      setCreateError('Please fill in title, affected area, and problem description.')
      return
    }
    const actions = createForm.suggested_actions_text
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    setCreateLoading(true)
    try {
      await recommendationService.createRecommendation({
        title: createForm.title,
        affected_area: createForm.affected_area,
        problem_description: createForm.problem_description,
        suggested_actions: actions.length ? actions : ['Conduct on-site environmental assessment.'],
        priority: createForm.priority,
        expected_impact: createForm.expected_impact || 'Positive urban sustainability impact.',
      })
      setShowCreateModal(false)
      setCreateForm({
        title: '',
        affected_area: '',
        problem_description: '',
        suggested_actions_text: '',
        priority: 'HIGH',
        expected_impact: '',
      })
      loadRecommendations()
    } catch (err) {
      setCreateError(err?.response?.data?.detail || 'Failed to create recommendation')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdatingId(id)
    try {
      await recommendationService.updateStatus(id, newStatus)
      loadRecommendations()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to update status')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const getPriorityBadge = (pr) => {
    const colorClasses = {
      URGENT: 'bg-red-100 text-red-800 border-red-200 font-bold',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200 font-semibold',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
      LOW: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${colorClasses[pr] || colorClasses.LOW}`}>
        {pr}
      </span>
    )
  }

  const getStatusBadge = (st) => {
    const colorClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-purple-100 text-purple-700',
      APPROVED: 'bg-blue-100 text-blue-700 font-medium',
      IMPLEMENTED: 'bg-emerald-100 text-emerald-800 font-bold',
      REJECTED: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${colorClasses[st] || 'bg-gray-100 text-gray-700'}`}>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sustainability Recommendations</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Decision-support proposals driven by municipal telemetry, complaint patterns, and urban resource audits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={loadRecommendations}>
              Refresh
            </Button>
            {canManage && (
              <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
                New Proposal
              </Button>
            )}
          </div>
        </div>

        {/* AI Integration Readiness Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-blue-900">IBM Granite Decision-Support Architecture Ready</p>
              <p className="text-xs text-blue-700 mt-0.5">
                The recommendation service schema is designed for seamless integration with IBM Granite LLM retrieval pipelines and municipal policy benchmarks.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-full">
            Future Phase Ready
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="IMPLEMENTED">Implemented</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {(priority || status) && (
            <button
              onClick={() => { setPriority(''); setStatus(''); }}
              className="text-xs text-navy-800 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Recommendations Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No Recommendations Found"
            description="No sustainability proposals match your filter criteria."
            action={canManage && <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Proposal</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {getPriorityBadge(rec.priority)}
                        {getStatusBadge(rec.status)}
                        <span className="text-xs text-gray-400">· {rec.affected_area}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{rec.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {rec.problem_description}
                  </p>

                  {/* Actions list */}
                  {Array.isArray(rec.suggested_actions) && rec.suggested_actions.length > 0 && (
                    <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-1.5">
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Proposed Municipal Interventions:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc">
                        {rec.suggested_actions.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-xs text-emerald-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-semibold block text-[11px] uppercase tracking-wide">Expected Impact:</span>
                    <span>{rec.expected_impact}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Logged: {formatDate(rec.created_at)}</span>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      {rec.status === 'PENDING' && (
                        <>
                          <button
                            disabled={statusUpdatingId === rec.id}
                            onClick={() => handleUpdateStatus(rec.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            disabled={statusUpdatingId === rec.id}
                            onClick={() => handleUpdateStatus(rec.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {rec.status === 'APPROVED' && (
                        <button
                          disabled={statusUpdatingId === rec.id}
                          onClick={() => handleUpdateStatus(rec.id, 'IMPLEMENTED')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md font-semibold transition-colors"
                        >
                          Mark Implemented
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Proposal Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Sustainability Proposal"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Proposal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Expand rooftop rainwater harvesting incentives"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Affected Ward / Jurisdiction *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 3 - South or City-Wide"
                  value={createForm.affected_area}
                  onChange={(e) => setCreateForm({ ...createForm, affected_area: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority Level *</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Problem Statement & Background *</label>
              <textarea
                required
                rows={3}
                placeholder="Detail the telemetry deficit, resident complaint trend, or environmental risk..."
                value={createForm.problem_description}
                onChange={(e) => setCreateForm({ ...createForm, problem_description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Suggested Interventions (One action per line)</label>
              <textarea
                rows={3}
                placeholder="Conduct sensor recalibration&#10;Subsidize citizen solar water heaters&#10;Deploy mobile patrol teams"
                value={createForm.suggested_actions_text}
                onChange={(e) => setCreateForm({ ...createForm, suggested_actions_text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expected Sustainability Impact</label>
              <input
                type="text"
                placeholder="e.g. 20% reduction in peak summer power demand"
                value={createForm.expected_impact}
                onChange={(e) => setCreateForm({ ...createForm, expected_impact: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createLoading}>Submit Proposal</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

