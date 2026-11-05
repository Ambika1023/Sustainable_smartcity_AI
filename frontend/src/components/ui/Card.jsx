import clsx from 'clsx'

const variants = {
  default: 'bg-white shadow-sm border border-gray-100',
  elevated: 'bg-white shadow-md border border-gray-100',
  flat: 'bg-gray-50 border border-gray-200',
  navy: 'bg-navy-900 text-white border border-navy-800',
}

export default function Card({
  title,
  subtitle,
  action,
  children,
  className,
  variant = 'default',
  padding = 'p-6',
  noPadding = false,
}) {
  return (
    <div
      className={clsx(
        'rounded-xl',
        variants[variant] || variants.default,
        !noPadding && padding,
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className={clsx(
                'font-semibold',
                variant === 'navy' ? 'text-white text-lg' : 'text-gray-900 text-lg'
              )}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={clsx(
                'text-sm mt-0.5',
                variant === 'navy' ? 'text-navy-300' : 'text-gray-500'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
