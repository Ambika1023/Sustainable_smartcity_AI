import { Link } from 'react-router-dom'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex w-20 h-20 bg-red-100 rounded-2xl items-center justify-center mb-6">
          <ShieldOff size={40} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">You don't have permission to access this page. Contact your system administrator if you believe this is an error.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          <ArrowLeft size={18} /> Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

