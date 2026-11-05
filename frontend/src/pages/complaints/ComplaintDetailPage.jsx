import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle, Building, User,
  MapPin, Phone, Mail, Calendar, FileText, Send, ShieldCheck
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { complaintService } from '../../services/complaintService'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import {
  COMPLAINT_STATUSES, COMPLAINT_PRIORITIES
} from '../../utils/constants'
import { formatDate, formatDateTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasAnyRole } = useAuth()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusRemark, setStatusRemark] = useState('')
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignDeptId, setAssignDeptId] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  const [remarkText, setRemarkText] = useState('')
  const [remarkSubmitting, setRemarkSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [compData, histData, deptData] = await Promise.all([
        complaintService.getComplaint(id),
        complaintService.getComplaintHistory(id),
        departmentService.getDepartments(),
      ])
      setComplaint(compData)
      setHistory(histData || [])
      setDepartments(deptData || [])
      setNewStatus(compData.status)
      setAssignDeptId(compData.department_id || '')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load complaint details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!newStatus) return
    setStatusSubmitting(true)
    try {
      await complaintService.updateStatus(id, {
        new_status: newStatus,
        remark: statusRemark || `Status updated to ${newStatus}`,
      })
      setShowStatusModal(false)
      setStatusRemark('')
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to update status')
    } finally {
      setStatusSubmitting(false)
    }
  }

  const handleAssignDepartment = async (e) => {
    e.preventDefault()
    if (!assignDeptId) return
    setAssignSubmitting(true)
    try {
      await complaintService.assignComplaint(id, {
        department_id: assignDeptId,
      })
      setShowAssignModal(false)
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to assign department')
    } finally {
      setAssignSubmitting(false)
    }
  }

  const handleAddRemark = async (e) => {
    e.preventDefault()
    if (!remarkText.trim()) return
    setRemarkSubmitting(true)
    try {
      await complaintService.addRemark(id, remarkText.trim())
      setRemarkText('')
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to add official remark')
    } finally {
      setRemarkSubmitting(false)
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

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto mt-12">
          <AlertTriangle className="mx-auto text-amber-500" size={40} />
          <h2 className="text-lg font-bold text-gray-800">Complaint Not Found</h2>
          <p className="text-sm text-gray-500">{error || 'Unable to locate the specified complaint record.'}</p>
          <Button variant="primary" onClick={() => navigate('/complaints')}>Return to Complaints</Button>
        </div>
      </DashboardLayout>
    )
  }

  const canManageStatus = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN', 'DEPARTMENT_OFFICER'])
  const canAssign = hasAnyRole(['SUPER_ADMIN', 'CITY_ADMIN'])
  const assignedDept = departments.find(d => d.id === complaint.department_id)

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/complaints"
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {complaint.complaint_number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                  {complaint.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  complaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 font-semibold' :
                  complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  complaint.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {complaint.priority} Priority
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{complaint.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canAssign && (
              <Button variant="secondary" onClick={() => setShowAssignModal(true)}>
                Assign Department
              </Button>
            )}
            {canManageStatus && (
              <Button variant="primary" onClick={() => setShowStatusModal(true)}>
                Update Status
              </Button>
            )}
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
              complaint.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              complaint.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {complaint.status === 'RESOLVED' ? <CheckCircle size={22} /> : <Clock size={22} />}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Status</p>
              <p className="text-base font-bold text-gray-900">{complaint.status.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="text-xs text-gray-400 block">Assigned Department</span>
              <span className="font-medium text-gray-800">{assignedDept?.name || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Submitted On</span>
              <span className="font-medium text-gray-800">{formatDate(complaint.created_at)}</span>
            </div>
            {complaint.resolved_at && (
              <div>
                <span className="text-xs text-green-600 block">Resolved On</span>
                <span className="font-medium text-green-700">{formatDate(complaint.resolved_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) - Complaint details & Remarks */}
          <div className="md:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Issue Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                {complaint.description}
              </p>

              <div className="pt-2 flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-800">Incident Location:</span> {complaint.location_address}
                </div>
              </div>
            </div>

            {/* Official Remarks Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest-600" />
                Official Remarks & Notes
              </h2>

              {complaint.official_remarks ? (
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 text-sm text-gray-800">
                  <p className="font-medium text-xs text-blue-800 mb-1">Latest Official Remark:</p>
                  <p>{complaint.official_remarks}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No official remarks recorded yet.</p>
              )}

              {canManageStatus && (
                <form onSubmit={handleAddRemark} className="space-y-3 pt-2">
                  <textarea
                    rows={2}
                    placeholder="Add official observation, inspection remark, or resolution note..."
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={remarkSubmitting}
                      disabled={!remarkText.trim()}
                      icon={Send}
                    >
                      Save Remark
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-navy-700" />
                Complaint Audit & History
              </h2>

              {history.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No transition history logged yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {history.map((h, idx) => (
                    <div key={h.id || idx} className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="text-xs text-gray-500">{formatDateTime(h.created_at)}</div>
                      <div className="text-sm font-semibold text-gray-800 mt-0.5">
                        Status updated to <span className="text-blue-600">{h.new_status}</span>
                      </div>
                      {h.remark && (
                        <p className="text-xs text-gray-600 mt-0.5 bg-gray-50 p-2 rounded border border-gray-100">
                          {h.remark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col) - Citizen & Metadata */}
          <div className="space-y-6">
            {/* Citizen Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User size={16} className="text-gray-500" />
                Citizen Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Name</span>
                  <span className="font-semibold text-gray-800 text-sm">{complaint.citizen_name}</span>
                </div>
                {complaint.citizen_phone && (
                  <div>
                    <span className="text-gray-400 block">Phone</span>
                    <a href={`tel:${complaint.citizen_phone}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {complaint.citizen_phone}
                    </a>
                  </div>
                )}
                {complaint.citizen_email && (
                  <div>
                    <span className="text-gray-400 block">Email</span>
                    <a href={`mailto:${complaint.citizen_email}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      <Mail size={12} /> {complaint.citizen_email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Department Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building size={16} className="text-gray-500" />
                Department Handling
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Assigned Department</span>
                  <span className="font-semibold text-gray-800">{assignedDept?.name || 'Pending Assignment'}</span>
                </div>
                {assignedDept && (
                  <div>
                    <span className="text-gray-400 block">Code</span>
                    <span className="font-mono text-gray-700">{assignedDept.code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Complaint Status"
          size="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              >
                {Object.keys(COMPLAINT_STATUSES).map((st) => (
                  <option key={st} value={st}>{COMPLAINT_STATUSES[st].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Resolution Remark / Action Note</label>
              <textarea
                rows={3}
                placeholder="Explain the reason for status change or actions taken..."
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={statusSubmitting}>Update Status</Button>
            </div>
          </form>
        </Modal>

        {/* Assign Department Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Department"
          size="md"
        >
          <form onSubmit={handleAssignDepartment} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Select Department *</label>
              <select
                required
                value={assignDeptId}
                onChange={(e) => setAssignDeptId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500">
              Assigning will transition this complaint to the <strong>ASSIGNED</strong> state and notify the respective department head.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={assignSubmitting}>Confirm Assignment</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

