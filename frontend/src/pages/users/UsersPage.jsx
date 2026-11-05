import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, UserPlus, Search, RefreshCw, Eye, Edit2, ShieldAlert,
  UserCheck, UserX, AlertCircle, Building
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userService } from '../../services/userService'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatRelativeTime, getInitials } from '../../utils/formatters'
import { getRoleDisplayName, getRoleColor } from '../../utils/rolePermissions'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'DEPARTMENT_OFFICER',
    department_id: '',
    phone: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: 'DEPARTMENT_OFFICER',
    department_id: '',
    phone: '',
    is_active: true,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartments()
      setDepartments(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers({
        page,
        per_page: 15,
        ...(search && { search }),
        ...(role && { role }),
        ...(departmentId && { department_id: departmentId }),
      })
      setUsers(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [page, search, role, departmentId])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      setCreateError('Please complete all mandatory fields.')
      return
    }
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters.')
      return
    }
    setCreateLoading(true)
    try {
      const payload = {
        ...createForm,
        department_id: createForm.department_id || null,
      }
      await userService.createUser(payload)
      setShowCreateModal(false)
      setCreateForm({
        full_name: '',
        email: '',
        password: '',
        role: 'DEPARTMENT_OFFICER',
        department_id: '',
        phone: '',
      })
      loadUsers()
    } catch (err) {
      setCreateError(err?.response?.data?.detail || 'Failed to create user account')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleOpenEdit = (u) => {
    setEditingUserId(u.id)
    setEditForm({
      full_name: u.full_name,
      role: u.role,
      department_id: u.department_id || '',
      phone: u.phone || '',
      is_active: u.is_active,
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditLoading(true)
    try {
      await userService.updateUser(editingUserId, {
        ...editForm,
        department_id: editForm.department_id || null,
      })
      setShowEditModal(false)
      loadUsers()
    } catch (err) {
      setEditError(err?.response?.data?.detail || 'Failed to update user')
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggleActive = async (u) => {
    const action = u.is_active ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${action} ${u.full_name}'s account?`)) return
    try {
      if (u.is_active) {
        await userService.deactivateUser(u.id)
      } else {
        await userService.activateUser(u.id)
      }
      loadUsers()
    } catch (err) {
      alert(err?.response?.data?.detail || `Failed to ${action} user`)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Government Official Accounts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Role-Based Access Control (RBAC) administration, department assignments, and security lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={loadUsers}>
              Refresh
            </Button>
            <Button variant="primary" icon={UserPlus} onClick={() => setShowCreateModal(true)}>
              Provision Official
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by official name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="CITY_ADMIN">City Administrator</option>
            <option value="DEPARTMENT_OFFICER">Department Officer</option>
            <option value="DATA_ANALYST">Data Analyst</option>
          </select>

          <select
            value={departmentId}
            onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-navy-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {(search || role || departmentId) && (
            <button
              onClick={() => { setSearch(''); setRole(''); setDepartmentId(''); setPage(1); }}
              className="text-xs text-navy-800 hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table-row" count={6} />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Officials Found"
              description="No government officials match your search or filter filters."
              action={<Button variant="primary" onClick={() => setShowCreateModal(true)}>Add Official</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                    <th className="py-3 px-4">Official Name & Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const dept = departments.find(d => d.id === u.department_id)
                    const isSelf = u.id === currentUser?.id
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {getInitials(u.full_name)}
                            </div>
                            <div>
                              <Link to={`/users/${u.id}`} className="font-semibold text-gray-900 hover:text-blue-600 block text-xs">
                                {u.full_name}
                              </Link>
                              <span className="text-[11px] text-gray-500 block">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                            {getRoleDisplayName(u.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-700">
                          {dept ? dept.name : <span className="text-gray-400 italic">None (Global)</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {u.last_login ? formatRelativeTime(u.last_login) : 'Never logged in'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <Link
                            to={`/users/${u.id}`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md inline-block transition-colors"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-gray-500 hover:text-navy-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit Role & Details"
                          >
                            <Edit2 size={15} />
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => handleToggleActive(u)}
                              className={`p-1.5 rounded-md transition-colors ${
                                u.is_active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={u.is_active ? 'Deactivate User' : 'Activate User'}
                            >
                              {u.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && users.length > 0 && (
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

        {/* Create Official Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Provision Government Official Account"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Official full name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                placeholder="official@smartcity.gov"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password (min 8 chars) *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">System Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  <option value="DEPARTMENT_OFFICER">Department Officer</option>
                  <option value="CITY_ADMIN">City Administrator</option>
                  <option value="DATA_ANALYST">Data Analyst</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Department</label>
                <select
                  value={createForm.department_id}
                  onChange={(e) => setCreateForm({ ...createForm, department_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  <option value="">None (Global)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Official Phone</label>
              <input
                type="text"
                placeholder="+91-XXXXXXXXXX"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createLoading}>Create Account</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Official Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Official Role & Department"
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            {editError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {editError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  <option value="DEPARTMENT_OFFICER">Department Officer</option>
                  <option value="CITY_ADMIN">City Administrator</option>
                  <option value="DATA_ANALYST">Data Analyst</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  <option value="">None (Global)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="edit_active" className="text-xs text-gray-700 font-medium">
                Active account status
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

