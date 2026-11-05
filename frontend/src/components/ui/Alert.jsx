import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    text: 'text-green-800',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    text: 'text-red-800',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    text: 'text-amber-800',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    text: 'text-blue-800',
  },
}

export default function Alert({
  variant = 'info',
  title,
  message,
  dismissible = false,
  autoDismiss = false,
  autoDismissDelay = 3000,
  onDismiss,
  className,
}) {
  const [visible, setVisible] = useState(true)
  const v = variants[variant] || variants.info
  const Icon = v.icon

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, autoDismissDelay)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, autoDismissDelay, onDismiss])

  if (!visible) return null

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border',
        v.container,
        className
      )}
    >
      <Icon size={18} className={clsx('flex-shrink-0 mt-0.5', v.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('font-semibold text-sm', v.text)}>{title}</p>
        )}
        {message && (
          <p className={clsx('text-sm', title ? 'mt-0.5' : '', v.text)}>{message}</p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setVisible(false)
            onDismiss?.()
          }}
          className={clsx('p-0.5 rounded hover:opacity-70 flex-shrink-0', v.iconColor)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
