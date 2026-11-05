import { useState, useEffect, useCallback } from 'react'
import { departmentService } from '../services/departmentService'

export function useDepartments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await departmentService.getDepartments()
      setDepartments(data.departments || data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return { departments, loading, error, refetch: fetchDepartments }
}
