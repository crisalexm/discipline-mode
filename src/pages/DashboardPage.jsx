import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, ChevronDown } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import Avatar from '../components/Avatar'
import {
  calculateBMI,
  getBMICategory,
  getPerformanceBadge,
  calcGoalProgress,
  getCurrentWeekNumber,
  isGainGoal,
} from '../lib/utils'

function MotivationalMessage({ rankingData }) {
  const messages = useMemo(() => {
    // "On track" = progressing toward THEIR goal (loss or gain)
    const onTrackCount = rankingData.filter((m) => {
      if (m.weeklyChange === null) return false
      return m.gainGoal ? m.weeklyChange > 0 : m.weeklyChange < 0
    }).length
    const fireCount = rankingData.filter((m) => {
      if (m.weeklyChange === null) return false
      return m.gainGoal ? m.weeklyChange >= 0.5 : m.weeklyChange <= -1.8
    }).length
    const total = rankingData.length

    if (fireCount >= total * 0.6) return { msg: '¡El grupo está EN LLAMAS! 🔥 Semana épica.', color: 'from-orange-900/40 to-red-900/40 border-orange-700' }
    if (onTrackCount >= total * 0.7) return { msg: '¡Gran semana! La mayoría avanzando hacia su meta. 💪', color: 'from-green-900/40 to-teal-900/40 border-green-700' }
    if (onTrackCount >= total * 0.4) return { msg: 'Mitad del grupo en camino. ¡A darle más! 💙', color: 'from-blue-900/40 to-indigo-900/40 border-blue-700' }
    return { msg: 'Semana difícil. ¡El lunes se retoma con todo! 💪', color: 'from-slate-800 to-slate-700 border-slate-600' }
  }, [rankingData])

  return (
    <div className={`bg-gradient-to-r ${messages.color} border rounded-xl px-4 py-3 text-sm text-white font-medium`}>
      {messages.msg}
    </div>
  )
}

function ProgressBar({ value, className = '' }) {
  return (
    <div className={`bg-slate-700 rounded-full h-1.5 w-full ${className}`}>
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const { members } = useMembers()
  const { weighIns } = useWeighIns()
  const navigate = useNavigate()
  const currentWeek = getCurrentWeekNumber()
  const [selectedWeek, setSelectedWeek] = useState('total')

  // Available weeks
  const weeks = useMemo(() => {
    const ws = [...new Set(weighIns.map((w) => w.week_number))].sort((a, b) => a - b)
    return ws
  }, [weighIns])

  // Build ranking data
  const rankingData = useMemo(() => {
    return members.map((member) => {
      const memberWeighIns = weighIns
        .filter((w) => w.member_id === member.id)
        .sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))

      const initialWeighIn = memberWeighIns[0]
      const latestWeighIn = memberWeighIns[memberWeighIns.length - 1]

      // For the selected week filter
      let weekWeighIn = null
      let prevWeekWeighIn = null

      if (selectedWeek === 'total') {
        weekWeighIn = latestWeighIn
        prevWeekWeighIn = memberWeighIns[memberWeighIns.length - 2] || null
      } else {
        const weekNum = parseInt(selectedWeek)
        weekWeighIn = memberWeighIns.filter((w) => w.week_number === weekNum).at(-1) || null
        // Find the previous available weigh-in
        const prevEntries = memberWeighIns.filter((w) => w.week_number < weekNum)
        prevWeekWeighIn = prevEntries.at(-1) || null
      }

      const currentWeight = weekWeighIn?.weight_kg ?? null
      const initialWeight = member.initial_weight_kg ?? initialWeighIn?.weight_kg ?? null
      const gainGoal = isGainGoal(initialWeight, member.goal_weight_kg)
      // totalChange: positive = gained, negative = lost
      const totalChange = currentWeight !== null && initialWeight !== null ? currentWeight - initialWeight : null
      const weeklyChange = currentWeight !== null && prevWeekWeighIn ? currentWeight - prevWeekWeighIn.weight_kg : null
      const goalProgress = currentWeight !== null ? calcGoalProgress(initialWeight, currentWeight, member.goal_weight_kg) : 0
      const bmi = currentWeight !== null ? calculateBMI(currentWeight, member.height_cm) : null
      const bmiCat = bmi !== null ? getBMICategory(bmi) : null
      const badge = getPerformanceBadge(weeklyChange, gainGoal)

      return {
        ...member,
        currentWeight,
        initialWeight,
        totalChange,
        weeklyChange,
        goalProgress,
        gainGoal,
        bmi,
        bmiCat,
        badge,
        hasData: weekWeighIn !== null,
      }
    }).sort((a, b) => {
      // Sort by goal progress % desc (works for both loss and gain)
      if (a.hasData && !b.hasData) return -1
      if (!a.hasData && b.hasData) return 1
      return b.goalProgress - a.goalProgress
    })
  }, [members, weighIns, selectedWeek])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Semana {currentWeek} del grupo</p>
        </div>
        {/* Week selector */}
        <div className="relative">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-blue-500"
          >
            <option value="total">Acumulado total</option>
            {weeks.map((w) => (
              <option key={w} value={w}>Semana {w}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Motivational message */}
      {rankingData.length > 0 && <MotivationalMessage rankingData={rankingData} />}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'kg perdidos (grupo)',
            // Only count loss-goal members' losses
            value: rankingData
              .filter((m) => !m.gainGoal && m.totalChange !== null && m.totalChange < 0)
              .reduce((acc, m) => acc + Math.abs(m.totalChange), 0)
              .toFixed(1) + ' kg',
            color: 'text-green-400',
          },
          {
            label: 'Miembros activos',
            value: rankingData.filter((m) => m.hasData).length + '/' + members.length,
            color: 'text-blue-400',
          },
          {
            label: '🔥 En llamas',
            value: rankingData.filter((m) => {
              if (m.weeklyChange === null) return false
              return m.gainGoal ? m.weeklyChange >= 0.5 : m.weeklyChange <= -1.8
            }).length,
            color: 'text-orange-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Ranking Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <h2 className="font-semibold text-white text-sm">Ranking</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-700">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-right px-4 py-3">Peso Inicial</th>
                <th className="text-right px-4 py-3">Peso Actual</th>
                <th className="text-right px-4 py-3">Cambio Total</th>
                <th className="text-right px-4 py-3">Semana</th>
                <th className="text-right px-4 py-3">% Meta</th>
                <th className="text-center px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((member, idx) => (
                <tr
                  key={member.id}
                  onClick={() => navigate(`/miembros/${member.id}`)}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-600' : 'text-slate-500'}`}>
                      {member.hasData ? idx + 1 : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={member.name} size="sm" />
                      <div>
                        <span className="text-white font-medium">{member.name}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${member.gainGoal ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                          {member.gainGoal ? '💪 Subir' : '🎯 Bajar'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">{member.initialWeight?.toFixed(1) ?? '-'} kg</td>
                  <td className="px-4 py-3 text-right text-white font-medium">
                    {member.currentWeight !== null ? `${member.currentWeight.toFixed(1)} kg` : <span className="text-slate-500">Pendiente ⏳</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.totalChange !== null ? (() => {
                      // Good = moving toward goal
                      const good = member.gainGoal ? member.totalChange > 0 : member.totalChange < 0
                      const sign = member.totalChange > 0 ? '+' : ''
                      return (
                        <span className={`font-semibold ${good ? 'text-green-400' : member.totalChange === 0 ? 'text-slate-400' : 'text-red-400'}`}>
                          {sign}{member.totalChange.toFixed(1)} kg
                        </span>
                      )
                    })() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.weeklyChange !== null ? (() => {
                      const good = member.gainGoal ? member.weeklyChange > 0 : member.weeklyChange < 0
                      const sign = member.weeklyChange > 0 ? '+' : ''
                      return (
                        <span className={good ? 'text-green-400' : member.weeklyChange === 0 ? 'text-slate-400' : 'text-red-400'}>
                          {sign}{member.weeklyChange.toFixed(1)} kg
                        </span>
                      )
                    })() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-slate-300 text-xs">{member.goalProgress.toFixed(0)}%</span>
                      <ProgressBar value={member.goalProgress} className="w-20" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-lg" title={member.badge.label}>{member.badge.emoji}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-700/50">
          {rankingData.map((member, idx) => (
            <div
              key={member.id}
              onClick={() => navigate(`/miembros/${member.id}`)}
              className="p-4 hover:bg-slate-700/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-600' : 'text-slate-500'}`}>
                  {member.hasData ? idx + 1 : '-'}
                </span>
                <Avatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{member.name}</span>
                    <span className="text-xl">{member.badge.emoji}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded-full ${member.gainGoal ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                      {member.gainGoal ? '💪 Subir' : '🎯 Bajar'}
                    </span>
                    <span>
                      {member.currentWeight !== null
                        ? `${member.currentWeight.toFixed(1)} kg`
                        : 'Pendiente ⏳'}
                    </span>
                    {member.totalChange !== null && (() => {
                      const good = member.gainGoal ? member.totalChange > 0 : member.totalChange < 0
                      const sign = member.totalChange > 0 ? '+' : ''
                      return (
                        <span className={good ? 'text-green-400' : member.totalChange === 0 ? 'text-slate-400' : 'text-red-400'}>
                          {sign}{member.totalChange.toFixed(1)} kg
                        </span>
                      )
                    })()}
                    {member.weeklyChange !== null && (() => {
                      const good = member.gainGoal ? member.weeklyChange > 0 : member.weeklyChange < 0
                      const sign = member.weeklyChange > 0 ? '+' : ''
                      return (
                        <span className={good ? 'text-green-400' : member.weeklyChange === 0 ? 'text-slate-400' : 'text-red-400'}>
                          {sign}{member.weeklyChange.toFixed(1)} sem
                        </span>
                      )
                    })()}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={member.goalProgress} className="flex-1" />
                    <span className="text-slate-500 text-xs">{member.goalProgress.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No hay miembros registrados.</p>
            <p className="text-xs mt-1">Agrega miembros en la pestaña Miembros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
