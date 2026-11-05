import clsx from 'clsx'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-navy-900 hover:bg-navy-800 text-white border border-transparent focus:ring-navy-500',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500',
  success: 'bg-forest-600 hover:bg-forest-700 text-white border border-transparent focus:ring-forest-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 border border-transparent focus:ring-gray-400',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white border border-transparent focus:ring-amber-400',
  outline: 'bg-transparent hover:bg-navy-50 text-navy-900 border border-navy-900 focus:ring-navy-500',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className,
  onClick,
  type = 'button',
  fullWidth = false,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'} />
      ) : Icon ? (
        <Icon size={size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={size === 'lg' ? 20 : 16} />}
    </button>
  )
}
