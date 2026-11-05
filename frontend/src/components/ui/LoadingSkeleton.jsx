import clsx from 'clsx'

export default function LoadingSkeleton({ variant = 'text', className, rows = 1 }) {
  if (variant === 'card') {
    return (
      <div className={clsx('bg-white rounded-xl border border-gray-100 p-6 animate-pulse', className)}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    )
  }

  if (variant === 'table-row') {
    return (
      <div className={clsx('animate-pulse flex gap-4 items-center py-3 px-4', className)}>
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/5" />
        <div className="h-4 bg-gray-100 rounded w-1/6" />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={clsx('animate-pulse space-y-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="h-64 bg-gray-100 rounded-lg flex items-end gap-2 px-4 pb-4">
          {[60, 80, 50, 90, 70, 85, 65, 75, 55, 95].map((h, i) => (
            <div key={i} className="bg-gray-200 rounded-t flex-1" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // Default: text skeleton
  return (
    <div className={clsx('animate-pulse', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-4 bg-gray-200 rounded',
            i < rows - 1 ? 'mb-2' : '',
            i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/6'
          )}
        />
      ))}
    </div>
  )
}
