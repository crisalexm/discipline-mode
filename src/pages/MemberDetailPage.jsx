import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Flame, TrendingDown, Target } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import Avatar from '../components/Avatar'
import {
  calculateBMI,
  getBMICategory,
  calcGoalProgress,
  getPerformanceBadge,
  isGainGoal,
  formatDate,
} from '../lib/utils'

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-slate-500 text-xs">{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">Semana {label}</p>
      <p className="text-white font-semibold">{payload[0]?.value?.toFixed(1)} kg</p>
    </div>
  )
}

export default function MemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members } = useMembers()
  const { weighIns } = useWeighIns(id)

  const member = members.find((m) => m.id === id)

  const sortedWeighIns = useMemo(
    () => [...weighIns].sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date)),
    [weighIns]
  )

  const chartData = sortedWeighIns.map((w) => ({
    week: w.week_number,
    peso: w.weight_kg,
    bmi: parseFloat(calculateBMI(w.weight_kg, member?.height_cm || 170).toFixed(1)),
  }))

  const gainGoal = member ? isGainGoal(member.initial_weight_kg, member.goal_weight_kg) : false

  // Consecutive streak of weeks moving toward goal
  const streak = useMemo(() => {
    let count = 0
    for (let i = sortedWeighIns.length - 1; i > 0; i--) {
      const improved = gainGoal
        ? sortedWeighIns[i].weight_kg > sortedWeighIns[i - 1].weight_kg  // gaining = good
        : sortedWeighIns[i].weight_kg < sortedWeighIns[i - 1].weight_kg  // losing  = good
      if (improved) count++
      else break
    }
    return count
  }, [sortedWeighIns, gainGoal])

  if (!member) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>Miembro no encontrado.</p>
        <button onClick={() => navigate('/miembros')} className="text-blue-400 mt-2 text-sm">
          ← Volver
        </button>
      </div>
    )
  }

  const latest = sortedWeighIns.at(-1)
  const currentWeight = latest?.weight_kg ?? member.initial_weight_kg
  // totalChange: positive = gained, negative = lost (raw delta, direction-neutral)
  const totalChange = currentWeight - member.initial_weight_kg
  const bmi = calculateBMI(currentWeight, member.height_cm)
  const bmiCat = getBMICategory(bmi)
  const progress = calcGoalProgress(member.initial_weight_kg, currentWeight, member.goal_weight_kg)
  // remaining: how far from goal in the RIGHT direction
  const remaining = gainGoal
    ? member.goal_weight_kg - currentWeight   // positive = still needs to gain
    : currentWeight - member.goal_weight_kg   // positive = still needs to lose

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/miembros')}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar name={member.name} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-white">{member.name}</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className={bmiCat.color}>{bmiCat.label}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{member.height_cm} cm</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Peso actual"
          value={`${currentWeight.toFixed(1)} kg`}
          color="text-white"
        />
        <StatCard
          label={gainGoal ? 'Ganancia total' : 'Pérdida total'}
          value={`${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg`}
          color={
            // Good = moved toward goal
            (gainGoal ? totalChange > 0 : totalChange < 0)
              ? 'text-green-400'
              : totalChange === 0
              ? 'text-slate-400'
              : 'text-red-400'
          }
        />
        <StatCard
          label="IMC actual"
          value={bmi.toFixed(1)}
          sub={bmiCat.label}
          color={bmiCat.color}
        />
        <StatCard
          label={gainGoal ? 'Racha subiendo' : 'Racha bajando'}
          value={`${streak} sem`}
          color={streak >= 2 ? 'text-orange-400' : 'text-slate-400'}
          sub={streak >= 2 ? '🔥' : streak === 1 ? '✅' : '-'}
        />
      </div>

      {/* Goal progress */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-blue-400" />
          <h2 className="text-white font-semibold text-sm">Progreso hacia la meta</h2>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Inicio: {member.initial_weight_kg} kg</span>
          <span>Meta: {member.goal_weight_kg} kg</span>
        </div>
        <div className="bg-slate-700 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">{progress.toFixed(1)}% completado</span>
          <span className={remaining > 0 ? 'text-blue-400' : 'text-green-400'}>
            {remaining > 0
              ? `Faltan ${remaining.toFixed(1)} kg ${gainGoal ? 'por ganar' : 'por perder'}`
              : '¡Meta alcanzada! 🎉'}
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-green-400" />
            <h2 className="text-white font-semibold text-sm">Evolución individual</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="week"
                tickFormatter={(v) => `S${v}`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weigh-in history */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-white font-semibold text-sm">Historial de pesajes</h2>
        </div>
        {sortedWeighIns.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Sin pesajes registrados.</div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {[...sortedWeighIns].reverse().map((w, idx, arr) => {
              const prev = arr[idx + 1]
              const change = prev ? w.weight_kg - prev.weight_kg : null
              const badge = getPerformanceBadge(change, gainGoal)
              const bmiRow = calculateBMI(w.weight_kg, member.height_cm)
              const bmiCatRow = getBMICategory(bmiRow)
              // Good change = moving toward goal
              const changeIsGood = change === null ? null : gainGoal ? change > 0 : change < 0

              return (
                <div key={w.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{w.weight_kg.toFixed(1)} kg</span>
                        <span className="text-lg">{badge.emoji}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>{formatDate(w.weigh_in_date)}</span>
                        <span>•</span>
                        <span>Semana {w.week_number}</span>
                        <span>•</span>
                        <span className={bmiCatRow.color}>IMC {bmiRow.toFixed(1)}</span>
                      </div>
                    </div>
                    {change !== null && (
                      <span className={`text-sm font-semibold ${changeIsGood ? 'text-green-400' : change === 0 ? 'text-slate-400' : 'text-red-400'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                  {w.notes && (
                    <p className="text-slate-500 text-xs mt-1 italic">"{w.notes}"</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
