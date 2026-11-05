import clsx from 'clsx'

const colorMap = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  navy: 'bg-navy-100 text-navy-900',
  forest: 'bg-forest-100 text-forest-700',
  amber: 'bg-amber-100 text-amber-700',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs rounded-full',
  md: 'px-2.5 py-0.5 text-xs rounded-full',
  lg: 'px-3 py-1 text-sm rounded-full',
}

export default function Badge({
  color = 'gray',
  size = 'md',
  children,
  className,
  dot = false,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium',
        colorMap[color] || colorMap.gray,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-blue-500': color === 'blue',
          'bg-green-500': color === 'green',
          'bg-red-500': color === 'red',
          'bg-orange-500': color === 'orange',
          'bg-yellow-500': color === 'yellow',
          'bg-purple-500': color === 'purple',
          'bg-gray-500': color === 'gray',
        })} />
      )}
      {children}
    </span>
  )
}
