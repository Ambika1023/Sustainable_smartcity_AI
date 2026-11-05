import { useState, useEffect, useCallback } from 'react'
import { complaintService } from '../services/complaintService'

export function useComplaints(initialParams = {}) {
  const [complaints, setComplaints] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComplaints = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const data = await complaintService.getComplaints(params)
      setComplaints(data.complaints || data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComplaints(initialParams)
  }, [])

  return { complaints, total, totalPages, loading, error, fetchComplaints }
}
