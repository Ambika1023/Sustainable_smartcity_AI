import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Search, Filter, Plus, Eye, RefreshCw, AlertCircle,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { complaintService } from '../../services/complaintService'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'
import {
  COMPLAINT_STATUSES, COMPLAINT_PRIORITIES, COMPLAINT_CATEGORIES
} from '../../utils/constants'
import { formatDate, formatRelativeTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

export default function ComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [departments, setDepartments] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Create Complaint Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Waste Management',
    priority: 'MEDIUM',
    citizen_name: '',
    citizen_email: '',
    citizen_phone: '',
    location_address: '',
    ward_id: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchStats = async () => {
    try {
      const data = await complaintService.getComplaintStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments()
      setDepartments(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: 15,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(departmentId && { department_id: departmentId }),
      }
      const data = await complaintService.getComplaints(params)
      setComplaints(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      console.error('Failed to fetch complaints', err)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status, category, priority, departmentId])

  useEffect(() => {
    fetchStats()
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('')
    setCategory('')
    setPriority('')
    setDepartmentId('')
    setPage(1)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!createForm.title || !createForm.description || !createForm.citizen_name || !createForm.location_address) {
      setCreateError('Please fill in all required fields.')
      return
    }
    setCreateLoading(true)
    try {
      // Use existing department or ward if empty
      const payload = {
        ...createForm,
        ward_id: createForm.ward_id || '00000000-0000-0000-0000-000000000001', // Fallback or UUID
      }
      await complaintService.createComplaint(payload)
      setShowCreateModal(false)
      setCreateForm({
        title: '',
        description: '',
        category: 'Waste Management',
        priority: 'MEDIUM',
        citizen_name: '',
        citizen_email: '',
        citizen_phone: '',
        location_address: '',
        ward_id: '',
      })
      fetchComplaints()
      fetchStats()
    } catch (err) {
      setCreateError(err?.response?.data?.detail || 'Failed to submit complaint')
    } finally {
      setCreateLoading(false)
    }
  }

  const getStatusBadge = (st) => {
    const config = COMPLAINT_STATUSES[st] || { label: st, color: 'gray' }
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[config.color] || colorClasses.gray}`}>
        {config.label}
      </span>
    )
  }

  const getPriorityBadge = (pr) => {
    const config = COMPLAINT_PRIORITIES[pr] || { label: pr, color: 'gray' }
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-600',
      blue: 'bg-blue-100 text-blue-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700 font-semibold',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${colorClasses[config.color] || colorClasses.gray}`}>
        {config.label}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Stats Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Complaint Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor, assign, and resolve citizen municipal complaints across city wards.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => { fetchComplaints(); fetchStats(); }}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Log New Complaint
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600"><MessageSquare size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Complaints</p>
                <p className="text-xl font-bold text-gray-900">{stats.total ?? 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600"><Clock size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Under Review / Pending</p>
                <p className="text-xl font-bold text-gray-900">{(stats.submitted || 0) + (stats.under_review || 0) + (stats.assigned || 0) + (stats.in_progress || 0)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50 text-green-600"><CheckCircle size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Resolved</p>
                <p className="text-xl font-bold text-gray-900">{stats.resolved ?? 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600"><AlertTriangle size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">High / Critical</p>
                <p className="text-xl font-bold text-gray-900">{(stats.high_priority || 0) + (stats.critical_priority || 0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search ID, title, citizen..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">All Statuses</option>
              {Object.keys(COMPLAINT_STATUSES).map((st) => (
                <option key={st} value={st}>{COMPLAINT_STATUSES[st].label}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">All Priorities</option>
              {Object.keys(COMPLAINT_PRIORITIES).map((pr) => (
                <option key={pr} value={pr}>{COMPLAINT_PRIORITIES[pr].label}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {(search || status || category || priority || departmentId) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>Filtering results</span>
              <button
                onClick={handleClearFilters}
                className="text-navy-700 hover:text-navy-900 font-medium underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table-row" count={6} />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No complaints found"
              description="No citizen complaints match your selected filters. Try adjusting search or filter options."
              action={<Button variant="secondary" onClick={handleClearFilters}>Reset Filters</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Citizen</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-xs text-blue-700">
                        {item.complaint_number}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link to={`/complaints/${item.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate">
                          {item.title}
                        </Link>
                        <span className="text-xs text-gray-500 truncate block">
                          {item.location_address}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-gray-800">{item.citizen_name}</div>
                        <div className="text-gray-400">{item.citizen_phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(item.priority)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        <div>{formatDate(item.created_at)}</div>
                        <div className="text-[11px] text-gray-400">{formatRelativeTime(item.created_at)}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/complaints/${item.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-navy-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && complaints.length > 0 && (
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

        {/* Log New Complaint Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Log Citizen Complaint"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Complaint Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Broken water pipeline at 4th block"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {Object.keys(COMPLAINT_PRIORITIES).map((p) => (
                    <option key={p} value={p}>{COMPLAINT_PRIORITIES[p].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the urban issue, exact impact, and details provided by citizen..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Citizen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Citizen full name"
                  value={createForm.citizen_name}
                  onChange={(e) => setCreateForm({ ...createForm, citizen_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Citizen Phone</label>
                <input
                  type="text"
                  placeholder="+91-XXXXXXXXXX"
                  value={createForm.citizen_phone}
                  onChange={(e) => setCreateForm({ ...createForm, citizen_phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Citizen Email</label>
                <input
                  type="email"
                  placeholder="citizen@example.com"
                  value={createForm.citizen_email}
                  onChange={(e) => setCreateForm({ ...createForm, citizen_email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location / Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 12th Cross, Near Metro Station, Ward 1"
                value={createForm.location_address}
                onChange={(e) => setCreateForm({ ...createForm, location_address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createLoading}>Submit Complaint</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

