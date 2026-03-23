import { getInitials, getAvatarColor } from '../lib/utils'

export default function Avatar({ name, size = 'md' }) {
  const initials = getInitials(name)
  const colorClass = getAvatarColor(name)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}
