import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  type = 'text',
  placeholder,
  className,
  required,
  id,
  ...rest
}, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-gray-700 uppercase tracking-wide"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon size={16} className="text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={clsx(
            'w-full border rounded-lg text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent',
            'placeholder:text-gray-400',
            Icon ? 'pl-10' : 'pl-3',
            RightIcon ? 'pr-10' : 'pr-3',
            'py-2',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-400'
              : 'border-gray-300 bg-white hover:border-gray-400'
          )}
          {...rest}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <RightIcon size={16} />
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
