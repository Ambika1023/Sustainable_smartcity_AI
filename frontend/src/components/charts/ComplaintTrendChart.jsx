import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate } from '../../utils/formatters'
import EmptyState from '../ui/EmptyState'
import { TrendingUp } from 'lucide-react'

export default function ComplaintTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No trend data"
        description="Complaint trend data will appear here once complaints are submitted."
        className="h-64"
      />
    )
  }

  const formatted = data.map(d => ({
    ...d,
    date: d.date ? formatDate(d.date) : d.label || '',
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            fontSize: '12px',
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="count"
          name="Complaints"
          stroke="#1e3a5f"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#1e3a5f' }}
          activeDot={{ r: 5 }}
        />
        {data[0]?.resolved !== undefined && (
          <Line
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#16a34a' }}
            activeDot={{ r: 5 }}
            strokeDasharray="5 3"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
