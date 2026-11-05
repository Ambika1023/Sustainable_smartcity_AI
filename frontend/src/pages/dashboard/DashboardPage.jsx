import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { analyticsService } from '../../services/analyticsService'
import { complaintService } from '../../services/complaintService'
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Timer, Leaf, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { formatDate, formatRelativeTime } from '../../utils/formatters'
import { Link } from 'react-router-dom'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#6b7280']

function StatCard({ icon: Icon, label, value, color, loading, change }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  )
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value?.toLocaleString() ?? '—'}</div>
      {change !== undefined && (
        <div className={`text-xs flex items-center gap-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {change >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          {Math.abs(change)}% from last month
        </div>
      )}
    </div>
  )
}

const STATUS_COLORS = { SUBMITTED:'bg-blue-100 text-blue-700', UNDER_REVIEW:'bg-yellow-100 text-yellow-700', ASSIGNED:'bg-purple-100 text-purple-700', IN_PROGRESS:'bg-orange-100 text-orange-700', RESOLVED:'bg-green-100 text-green-700', REJECTED:'bg-red-100 text-red-700' }
const PRIORITY_COLORS = { LOW:'bg-gray-100 text-gray-600', MEDIUM:'bg-blue-100 text-blue-700', HIGH:'bg-orange-100 text-orange-700', CRITICAL:'bg-red-100 text-red-700' }

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [deptPerf, setDeptPerf] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sumData, trendsData, deptData, compData] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getComplaintTrends(30),
          analyticsService.getDepartmentPerformance(),
          complaintService.getComplaints({ page: 1, per_page: 5 }),
        ])
        setSummary(sumData)
        setTrends(trendsData)
        setDeptPerf(deptData)
        setRecentComplaints(compData.items || [])

        // Category distribution from stats
        const stats = await complaintService.getComplaintStats()
        // We'll use a simplified category view
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Complaints',    value: summary?.total_complaints,      icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Complaints',  value: summary?.pending_complaints,     icon: Clock,         color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Resolved Complaints', value: summary?.resolved_complaints,    icon: CheckCircle,   color: 'bg-green-100 text-green-600' },
    { label: 'High Priority',       value: summary?.high_priority_complaints, icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
    { label: 'Avg Resolution (days)',value: summary?.avg_resolution_days,   icon: Timer,         color: 'bg-purple-100 text-purple-600' },
    { label: 'Sustainability Score', value: summary?.sustainability_score !== undefined ? `${summary.sustainability_score}/100` : undefined, icon: Leaf, color: 'bg-emerald-100 text-emerald-600' },
  ]

  return (
    <DashboardLayout>
      {summary && !summary.has_real_data && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          Showing sample data. Seed the database or add real data to see actual statistics.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {statCards.map(card => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Complaint Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Complaint Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Complaints']} labelFormatter={v => `Date: ${v}`} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptPerf.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 9 }} width={80} />
              <Tooltip />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[0,3,3,0]} />
              <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Recent Complaints</h3>
          <Link to="/complaints" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : recentComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No complaints yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Complaint #','Title','Category','Priority','Status','Date'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Link to={`/complaints/${c.id}`} className="text-blue-600 hover:underline font-medium text-xs">{c.complaint_number}</Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700 max-w-[180px] truncate">{c.title}</td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{c.category}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`badge text-xs ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`badge text-xs ${STATUS_COLORS[c.status]}`}>{c.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2.5 text-gray-400 text-xs">{formatRelativeTime(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

