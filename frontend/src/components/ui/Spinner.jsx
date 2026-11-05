import clsx from 'clsx'

const sizes = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
}

const colors = {
  white: 'border-white/30 border-t-white',
  navy: 'border-navy-200 border-t-navy-900',
  gray: 'border-gray-200 border-t-gray-600',
  green: 'border-green-200 border-t-green-600',
  red: 'border-red-200 border-t-red-600',
}

export default function Spinner({ size = 'md', color = 'navy', className }) {
  return (
    <div
      className={clsx(
        'rounded-full animate-spin flex-shrink-0',
        sizes[size] || sizes.md,
        colors[color] || colors.navy,
        className
      )}
    />
  )
}
