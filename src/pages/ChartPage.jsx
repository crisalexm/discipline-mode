import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import { getAvatarColor } from '../lib/utils'

// Map Tailwind color classes to hex values
const COLOR_MAP = {
  'bg-blue-600': '#2563eb',
  'bg-purple-600': '#9333ea',
  'bg-green-600': '#16a34a',
  'bg-red-600': '#dc2626',
  'bg-yellow-600': '#ca8a04',
  'bg-pink-600': '#db2777',
  'bg-indigo-600': '#4f46e5',
  'bg-teal-600': '#0d9488',
}

function getMemberColor(name) {
  const tailwindClass = getAvatarColor(name)
  return COLOR_MAP[tailwindClass] || '#6366f1'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-2 font-medium">Semana {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white font-semibold">{entry.value?.toFixed(1)} kg</span>
        </div>
      ))}
    </div>
  )
}

export default function ChartPage() {
  const { members } = useMembers()
  const { weighIns } = useWeighIns()
  const [hiddenMembers, setHiddenMembers] = useState(new Set())

  const toggleMember = (memberId) => {
    setHiddenMembers((prev) => {
      const next = new Set(prev)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
  }

  // Build chart data keyed by week
  const chartData = useMemo(() => {
    const weekMap = {}
    weighIns.forEach((w) => {
      const week = w.week_number
      if (!weekMap[week]) weekMap[week] = { week }
      const member = members.find((m) => m.id === w.member_id)
      if (member) weekMap[week][member.name] = w.weight_kg
    })
    return Object.values(weekMap).sort((a, b) => a.week - b.week)
  }, [weighIns, members])

  const visibleMembers = members.filter((m) => !hiddenMembers.has(m.id))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Evolución del peso</h1>
        <p className="text-slate-400 text-sm">Gráfico de líneas por semana</p>
      </div>

      {/* Legend / toggles */}
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const color = getMemberColor(member.name)
          const hidden = hiddenMembers.has(member.id)
          return (
            <button
              key={member.id}
              onClick={() => toggleMember(member.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                hidden
                  ? 'border-slate-700 text-slate-500 bg-slate-800'
                  : 'border-slate-600 text-white bg-slate-700'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hidden ? '#475569' : color }}
              />
              {member.name.split(' ')[0]}
            </button>
          )
        })}
      </div>

      {/* Main chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            Se necesitan al menos 2 semanas de datos para mostrar el gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="week"
                tickFormatter={(v) => `S${v}`}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {visibleMembers.map((member) => (
                <Line
                  key={member.id}
                  type="monotone"
                  dataKey={member.name}
                  stroke={getMemberColor(member.name)}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-member mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {members.map((member) => {
          const memberWeighIns = weighIns
            .filter((w) => w.member_id === member.id)
            .sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))
          const latest = memberWeighIns.at(-1)
          const initial = member.initial_weight_kg || memberWeighIns[0]?.weight_kg
          const totalLoss = latest && initial ? initial - latest.weight_kg : null
          const color = getMemberColor(member.name)

          return (
            <div key={member.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-white text-sm font-medium truncate">{member.name.split(' ')[0]}</span>
              </div>
              <div className="text-slate-400 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Inicial</span>
                  <span className="text-slate-300">{initial?.toFixed(1) ?? '-'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual</span>
                  <span className="text-slate-300">{latest?.weight_kg.toFixed(1) ?? '-'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Pérdida</span>
                  <span className={totalLoss !== null ? (totalLoss > 0 ? 'text-green-400 font-semibold' : 'text-red-400') : 'text-slate-500'}>
                    {totalLoss !== null ? `${totalLoss > 0 ? '-' : '+'}${Math.abs(totalLoss).toFixed(1)} kg` : 'Sin datos'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
