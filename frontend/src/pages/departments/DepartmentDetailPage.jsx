import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building, Users, CheckCircle, Clock,
  MessageSquare, Edit3, ShieldAlert, AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { departmentService } from '../../services/departmentService'
import { complaintService } from '../../services/complaintService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

export default function DepartmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()

  const [dept, setDept] = useState(null)
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', is_active: true })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const canEdit = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN'])

  const loadData = async () => {
    setLoading(true)
    try {
      const [deptData, statsData, compData] = await Promise.all([
        departmentService.getDepartment(id),
        departmentService.getDepartmentStats(id),
        complaintService.getComplaints({ department_id: id, per_page: 8 }),
      ])
      setDept(deptData)
      setStats(statsData)
      setComplaints(compData.items || [])
      setEditForm({
        name: deptData.name,
        description: deptData.description || '',
        is_active: deptData.is_active,
      })
    } catch (err) {
      console.error('Failed to load department details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditLoading(true)
    try {
      await departmentService.updateDepartment(id, editForm)
      setShowEditModal(false)
      loadData()
    } catch (err) {
      setEditError(err?.response?.data?.detail || 'Failed to update department')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-5xl">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </DashboardLayout>
    )
  }

  if (!dept) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center max-w-md mx-auto mt-12">
          <AlertCircle className="mx-auto text-amber-500 mb-2" size={36} />
          <h2 className="text-lg font-bold text-gray-800">Department Not Found</h2>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/departments')}>
            Back to Departments
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/departments"
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {dept.code}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  dept.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {dept.is_active ? 'Operational' : 'Inactive'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{dept.name}</h1>
            </div>
          </div>

          {canEdit && (
            <Button variant="secondary" icon={Edit3} onClick={() => setShowEditModal(true)}>
              Edit Department
            </Button>
          )}
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Assigned Complaints</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_complaints}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs text-green-700 font-medium">Resolved Complaints</span>
              <p className="text-2xl font-bold text-green-800 mt-1">{stats.resolved_complaints}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs text-yellow-700 font-medium">Pending Complaints</span>
              <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.pending_complaints}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs text-blue-700 font-medium">Resolution Rate</span>
              <p className="text-2xl font-bold text-blue-800 mt-1">{stats.resolution_rate}%</p>
            </div>
          </div>
        )}

        {/* Description & Scope */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Department Scope & Duties</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {dept.description || 'No detailed jurisdiction statement registered.'}
          </p>
        </div>

        {/* Recent Complaints Assigned */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Complaints Assigned to this Department</h2>
            </div>
            <Link
              to={`/complaints?department_id=${id}`}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all in Complaint Portal →
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No active citizen complaints assigned to this department.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Citizen</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Logged On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-xs text-blue-600">
                        <Link to={`/complaints/${c.id}`} className="hover:underline">{c.complaint_number}</Link>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-800 truncate max-w-xs">{c.title}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-600">{c.citizen_name}</td>
                      <td className="py-2.5 px-4 text-xs font-semibold">{c.priority}</td>
                      <td className="py-2.5 px-4 text-xs">{c.status}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Department Information"
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            {editError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {editError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dept_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="dept_active" className="text-xs text-gray-700 font-medium">
                Active municipal department
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={editLoading}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

