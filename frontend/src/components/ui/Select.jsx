import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  options = [],
  error,
  placeholder = 'Select an option',
  className,
  required,
  id,
  value,
  onChange,
  ...rest
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-gray-700 uppercase tracking-wide"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={clsx(
            'w-full border rounded-lg text-sm py-2 pl-3 pr-9 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent',
            'transition-all duration-200 bg-white',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
