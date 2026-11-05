import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building, Plus, RefreshCw, Users, CheckCircle, Clock,
  ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'

export default function DepartmentsPage() {
  const { hasAnyRole } = useAuth()
  const [departments, setDepartments] = useState([])
  const [statsMap, setStatsMap] = useState({})
  const [loading, setLoading] = useState(true)

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', code: '', description: '' })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  const canCreate = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN'])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await departmentService.getDepartments()
      setDepartments(data || [])

      // Load stats for each department in parallel
      const statsPromises = (data || []).map(async (dept) => {
        try {
          const s = await departmentService.getDepartmentStats(dept.id)
          return { id: dept.id, stats: s }
        } catch {
          return { id: dept.id, stats: null }
        }
      })
      const resolvedStats = await Promise.all(statsPromises)
      const map = {}
      resolvedStats.forEach((item) => {
        if (item.stats) map[item.id] = item.stats
      })
      setStatsMap(map)
    } catch (err) {
      console.error('Failed to load departments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!createForm.name || !createForm.code) {
      setCreateError('Name and Code are required.')
      return
    }
    setCreateLoading(true)
    try {
      await departmentService.createDepartment(createForm)
      setShowCreateModal(false)
      setCreateForm({ name: '', code: '', description: '' })
      loadData()
    } catch (err) {
      setCreateError(err?.response?.data?.detail || 'Failed to create department')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Department Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor operational municipal departments, assigned officers, and resolution performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={loadData}>
              Refresh
            </Button>
            {canCreate && (
              <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
                Add Department
              </Button>
            )}
          </div>
        </div>

        {/* Department Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No departments found"
            description="No municipal departments are configured in the system."
            action={canCreate && <Button variant="primary" onClick={() => setShowCreateModal(true)}>Add Department</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => {
              const stats = statsMap[dept.id] || {}
              const rate = stats.resolution_rate ?? 0
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                          <Building size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{dept.name}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                            {dept.code}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        dept.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                      {dept.description || 'Dedicated municipal service department.'}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-400 block text-[10px] font-medium uppercase">Complaints</span>
                        <span className="font-bold text-gray-800 text-sm">{stats.total_complaints ?? 0}</span>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <span className="text-green-700 block text-[10px] font-medium uppercase">Resolved</span>
                        <span className="font-bold text-green-800 text-sm">{stats.resolved_complaints ?? 0}</span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <span className="text-blue-700 block text-[10px] font-medium uppercase">Officers</span>
                        <span className="font-bold text-blue-800 text-sm">{stats.officer_count ?? 0}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                        <span>Resolution Rate</span>
                        <span className="text-gray-900 font-bold">{rate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/departments/${dept.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-navy-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-gray-200"
                    >
                      View Department Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Department Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Municipal Department"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Environmental Protection"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. EP"
                maxLength={6}
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Responsibilities, scope, and jurisdiction..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createLoading}>Create Department</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

