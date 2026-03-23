// Group start date
export const GROUP_START_DATE = new Date('2026-03-09')

/**
 * Calculate week number from group start date
 * Week 0 = initial weigh-in (Mar 9)
 * Week 2 = first real cut (Mar 23)
 */
export function getWeekNumber(date) {
  const d = new Date(date)
  const diffMs = d - GROUP_START_DATE
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.round(diffDays / 7))
}

export function getCurrentWeekNumber() {
  return getWeekNumber(new Date())
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-yellow-400' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-400' }
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-400' }
  if (bmi < 35) return { label: 'Obesidad I', color: 'text-orange-400' }
  if (bmi < 40) return { label: 'Obesidad II', color: 'text-red-400' }
  return { label: 'Obesidad III', color: 'text-red-600' }
}

/**
 * Returns true if the member's goal is to gain weight (e.g. muscle mass)
 */
export function isGainGoal(initialWeight, goalWeight) {
  return goalWeight > initialWeight
}

/**
 * Get performance badge based on weekly change.
 * gainGoal=true  → gaining weight is good 💪
 * gainGoal=false → losing weight is good  🔥
 */
export function getPerformanceBadge(weeklyChange, gainGoal = false) {
  if (weeklyChange === null || weeklyChange === undefined)
    return { emoji: '⏳', label: 'Pendiente', color: 'text-slate-400' }

  if (!gainGoal) {
    // Weight-loss goal
    if (weeklyChange <= -1.8) return { emoji: '🔥', label: '¡En llamas!', color: 'text-orange-400' }
    if (weeklyChange < 0)     return { emoji: '✅', label: 'Bajando',     color: 'text-green-400' }
    if (weeklyChange === 0)   return { emoji: '⚠️', label: 'Sin cambio', color: 'text-yellow-400' }
    return                           { emoji: '📈', label: 'Subió',       color: 'text-red-400' }
  } else {
    // Weight-gain goal
    if (weeklyChange >= 0.5) return { emoji: '💪', label: '¡Ganando!',   color: 'text-green-400' }
    if (weeklyChange > 0)    return { emoji: '✅', label: 'Subiendo',     color: 'text-green-400' }
    if (weeklyChange === 0)  return { emoji: '⚠️', label: 'Sin cambio',  color: 'text-yellow-400' }
    return                          { emoji: '📉', label: 'Bajó',         color: 'text-red-400' }
  }
}

/**
 * Calculate progress percentage toward goal (works for both loss and gain).
 */
export function calcGoalProgress(initialWeight, currentWeight, goalWeight) {
  if (initialWeight === goalWeight) return 100
  if (isGainGoal(initialWeight, goalWeight)) {
    // Gain: how much of the target gained so far
    const totalToGain = goalWeight - initialWeight
    const gained = currentWeight - initialWeight
    return Math.min(100, Math.max(0, (gained / totalToGain) * 100))
  } else {
    // Loss: how much of the target lost so far
    const totalToLose = initialWeight - goalWeight
    const lost = initialWeight - currentWeight
    return Math.min(100, Math.max(0, (lost / totalToLose) * 100))
  }
}

/**
 * Get avatar initials from name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Avatar background colors based on name
 */
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-red-600',
  'bg-yellow-600',
  'bg-pink-600',
  'bg-indigo-600',
  'bg-teal-600',
]

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
