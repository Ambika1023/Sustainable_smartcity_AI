import clsx from 'clsx'
import { InboxIcon } from 'lucide-react'

export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'No data found',
  description,
  action,
  className,
  iconColor = 'text-gray-300',
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className={clsx('mb-4', iconColor)}>
        <Icon size={56} strokeWidth={1} />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
