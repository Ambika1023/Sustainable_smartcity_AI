import { useState, useRef } from 'react'
import clsx from 'clsx'

export default function Tooltip({ children, content, position = 'top', className }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  if (!content) return <>{children}</>

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      ref={ref}
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap shadow-lg pointer-events-none',
            positionClasses[position] || positionClasses.top
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
