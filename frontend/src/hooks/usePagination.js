import { useState, useCallback } from 'react'

export function usePagination(initialPage = 1, initialPerPage = 10) {
  const [page, setPage] = useState(initialPage)
  const [perPage, setPerPage] = useState(initialPerPage)

  const goToPage = useCallback((newPage) => {
    setPage(newPage)
  }, [])

  const goToNextPage = useCallback(() => {
    setPage(prev => prev + 1)
  }, [])

  const goToPrevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setPage(1)
  }, [])

  const changePerPage = useCallback((newPerPage) => {
    setPerPage(newPerPage)
    setPage(1)
  }, [])

  return {
    page,
    perPage,
    setPage: goToPage,
    goToNextPage,
    goToPrevPage,
    reset,
    changePerPage,
  }
}
