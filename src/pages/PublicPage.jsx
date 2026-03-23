import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Trophy, TrendingUp, Users, Lock, Flame } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import Avatar from '../components/Avatar'
import {
  calculateBMI,
  getBMICategory,
  getPerformanceBadge,
  calcGoalProgress,
  getCurrentWeekNumber,
  formatDate,
  getAvatarColor,
} from '../lib/utils'

// ─── Colores para el gráfico ────────────────────────────────────────────────
const COLOR_MAP = {
  'bg-blue-600': '#2563eb', 'bg-purple-600': '#9333ea',
  'bg-green-600': '#16a34a', 'bg-red-600': '#dc2626',
  'bg-yellow-600': '#ca8a04', 'bg-pink-600': '#db2777',
  'bg-indigo-600': '#4f46e5', 'bg-teal-600': '#0d9488',
}
function getMemberColor(name) {
  return COLOR_MAP[getAvatarColor(name)] || '#6366f1'
}

// ─── Tooltip del gráfico ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">Semana {label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name.split(' ')[0]}:</span>
          <span className="text-white font-bold">{e.value?.toFixed(1)} kg</span>
        </div>
      ))}
    </div>
  )
}

// ─── Barra de progreso ──────────────────────────────────────────────────────
function ProgressBar({ value }) {
  return (
    <div className="bg-slate-700 rounded-full h-1.5 w-full">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── Tab selector ───────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  const items = [
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'graficos', label: 'Gráficos', icon: TrendingUp },
    { id: 'miembros', label: 'Miembros', icon: Users },
  ]
  return (
    <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            active === id
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: RANKING
// ═══════════════════════════════════════════════════════════════════════════
function RankingTab({ members, weighIns, onSelectMember }) {
  const currentWeek = getCurrentWeekNumber()
  const [selectedWeek, setSelectedWeek] = useState('total')

  const weeks = useMemo(() => {
    return [...new Set(weighIns.map((w) => w.week_number))].sort((a, b) => a - b)
  }, [weighIns])

  const rankingData = useMemo(() => {
    return members.map((member) => {
      const memberWIs = weighIns
        .filter((w) => w.member_id === member.id)
        .sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))

      let weekWI, prevWI
      if (selectedWeek === 'total') {
        weekWI = memberWIs.at(-1)
        prevWI = memberWIs.at(-2) ?? null
      } else {
        const wn = parseInt(selectedWeek)
        weekWI = memberWIs.filter((w) => w.week_number === wn).at(-1) ?? null
        prevWI = memberWIs.filter((w) => w.week_number < wn).at(-1) ?? null
      }

      const currentWeight = weekWI?.weight_kg ?? null
      const initialWeight = member.initial_weight_kg
      const totalLoss = currentWeight !== null ? initialWeight - currentWeight : null
      const weeklyChange = currentWeight !== null && prevWI ? currentWeight - prevWI.weight_kg : null
      const goalProgress = currentWeight !== null ? calcGoalProgress(initialWeight, currentWeight, member.goal_weight_kg) : 0
      const badge = getPerformanceBadge(weeklyChange)

      return { ...member, currentWeight, initialWeight, totalLoss, weeklyChange, goalProgress, badge, hasData: weekWI !== null }
    }).sort((a, b) => {
      if (a.hasData && !b.hasData) return -1
      if (!a.hasData && b.hasData) return 1
      if (a.totalLoss === null) return 1
      if (b.totalLoss === null) return -1
      return b.totalLoss - a.totalLoss
    })
  }, [members, weighIns, selectedWeek])

  // Mensaje motivacional
  const motivMsg = useMemo(() => {
    const fire = rankingData.filter((m) => m.weeklyChange !== null && m.weeklyChange <= -1.8).length
    const losing = rankingData.filter((m) => m.weeklyChange !== null && m.weeklyChange < 0).length
    const n = rankingData.length
    if (fire >= n * 0.6) return { msg: '¡El grupo está EN LLAMAS esta semana! 🔥', cls: 'from-orange-900/40 to-red-900/40 border-orange-700' }
    if (losing >= n * 0.7) return { msg: '¡Gran semana para el grupo! La mayoría bajando. 💪', cls: 'from-green-900/40 to-teal-900/40 border-green-700' }
    if (losing >= n * 0.4) return { msg: 'La mitad del grupo avanzando. ¡A darle más! 💙', cls: 'from-blue-900/40 to-indigo-900/40 border-blue-700' }
    return { msg: 'Semana difícil. ¡La próxima se retoma con todo! 💪', cls: 'from-slate-800 to-slate-700 border-slate-600' }
  }, [rankingData])

  const totalLostGroup = rankingData.reduce((s, m) => s + (m.totalLoss || 0), 0)
  const activeCount = rankingData.filter((m) => m.hasData).length
  const fireCount = rankingData.filter((m) => m.weeklyChange !== null && m.weeklyChange <= -1.8).length

  return (
    <div className="space-y-4">
      {/* Mensaje motivacional */}
      <div className={`bg-gradient-to-r ${motivMsg.cls} border rounded-xl px-4 py-3 text-sm text-white font-medium`}>
        {motivMsg.msg}
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total perdido', value: `-${totalLostGroup.toFixed(1)} kg`, color: 'text-green-400' },
          { label: 'Con registro', value: `${activeCount}/${members.length}`, color: 'text-blue-400' },
          { label: '🔥 En llamas', value: fireCount, color: 'text-orange-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Selector de semana */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">Ver:</span>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="total">Acumulado total</option>
          {weeks.map((w) => <option key={w} value={w}>Semana {w}</option>)}
        </select>
        <span className="text-slate-600 text-xs ml-auto">Semana actual: {currentWeek}</span>
      </div>

      {/* Ranking cards */}
      <div className="space-y-2">
        {rankingData.map((member, idx) => (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className="w-full bg-slate-800 border border-slate-700 hover:border-blue-600/50 rounded-xl p-3.5 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Posición */}
              <span className={`text-base font-bold w-6 text-center flex-shrink-0 ${
                idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-500' : 'text-slate-600'
              }`}>
                {member.hasData ? (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1) : '—'}
              </span>

              <Avatar name={member.name} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-semibold text-sm">{member.name.split(' ')[0]}</span>
                  <div className="flex items-center gap-2">
                    {member.weeklyChange !== null && (
                      <span className={`text-xs font-bold ${member.weeklyChange < 0 ? 'text-green-400' : member.weeklyChange > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {member.weeklyChange > 0 ? '+' : ''}{member.weeklyChange.toFixed(1)} sem
                      </span>
                    )}
                    <span className="text-lg leading-none">{member.badge.emoji}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span className="text-slate-300 font-medium">
                    {member.currentWeight !== null ? `${member.currentWeight.toFixed(1)} kg` : 'Pendiente ⏳'}
                  </span>
                  {member.totalLoss !== null && (
                    <span className={member.totalLoss > 0 ? 'text-green-400' : 'text-red-400'}>
                      {member.totalLoss > 0 ? '−' : '+'}{Math.abs(member.totalLoss).toFixed(1)} kg total
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ProgressBar value={member.goalProgress} />
                  <span className="text-slate-500 text-xs flex-shrink-0">{member.goalProgress.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: GRÁFICOS
// ═══════════════════════════════════════════════════════════════════════════
function GraficosTab({ members, weighIns }) {
  const [hidden, setHidden] = useState(new Set())

  const toggle = (id) => setHidden((p) => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const chartData = useMemo(() => {
    const map = {}
    weighIns.forEach((w) => {
      if (!map[w.week_number]) map[w.week_number] = { week: w.week_number }
      const m = members.find((m) => m.id === w.member_id)
      if (m) map[w.week_number][m.name] = w.weight_kg
    })
    return Object.values(map).sort((a, b) => a.week - b.week)
  }, [weighIns, members])

  return (
    <div className="space-y-4">
      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        {members.map((m) => {
          const color = getMemberColor(m.name)
          const isHidden = hidden.has(m.id)
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isHidden ? 'border-slate-700 text-slate-500 bg-slate-800' : 'border-slate-600 text-white bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isHidden ? '#475569' : color }} />
              {m.name.split(' ')[0]}
            </button>
          )
        })}
      </div>

      {/* Gráfico */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white text-sm font-semibold mb-3">Evolución grupal</h3>
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-52 text-slate-500 text-sm">
            Se necesitan 2 semanas de datos para mostrar el gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tickFormatter={(v) => `S${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip />} />
              {members.filter((m) => !hidden.has(m.id)).map((m) => (
                <Line key={m.id} type="monotone" dataKey={m.name} stroke={getMemberColor(m.name)}
                  strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-2">
        {members.map((m) => {
          const mWIs = weighIns.filter((w) => w.member_id === m.id).sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))
          const latest = mWIs.at(-1)
          const initial = m.initial_weight_kg
          const loss = latest ? initial - latest.weight_kg : null
          return (
            <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getMemberColor(m.name) }} />
                <span className="text-white text-xs font-semibold truncate">{m.name.split(' ')[0]}</span>
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Inicio</span><span className="text-slate-300">{initial.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Actual</span><span className="text-slate-300">{latest?.weight_kg.toFixed(1) ?? '—'} kg</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Perdida</span>
                  <span className={loss !== null ? (loss > 0 ? 'text-green-400 font-bold' : 'text-red-400') : 'text-slate-600'}>
                    {loss !== null ? `${loss > 0 ? '−' : '+'}${Math.abs(loss).toFixed(1)} kg` : '—'}
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

// ═══════════════════════════════════════════════════════════════════════════
// TAB: MIEMBROS
// ═══════════════════════════════════════════════════════════════════════════
function MiembrosTab({ members, weighIns, onSelectMember }) {
  return (
    <div className="space-y-3">
      {members.map((member) => {
        const mWIs = weighIns.filter((w) => w.member_id === member.id).sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))
        const latest = mWIs.at(-1)
        const currentWeight = latest?.weight_kg ?? member.initial_weight_kg
        const bmi = calculateBMI(currentWeight, member.height_cm)
        const bmiCat = getBMICategory(bmi)
        const progress = calcGoalProgress(member.initial_weight_kg, currentWeight, member.goal_weight_kg)
        const remaining = currentWeight - member.goal_weight_kg

        return (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className="w-full bg-slate-800 border border-slate-700 hover:border-blue-600/50 rounded-xl p-4 text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={member.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold">{member.name}</h3>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className={bmiCat.color}>{bmiCat.label}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">IMC {bmi.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold">{currentWeight.toFixed(1)} kg</div>
                <div className="text-slate-500 text-xs">{member.height_cm} cm</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Meta: {member.goal_weight_kg} kg</span>
                <span className={remaining > 0 ? 'text-slate-400' : 'text-green-400'}>
                  {remaining > 0 ? `Faltan ${remaining.toFixed(1)} kg` : '¡Meta alcanzada! 🎉'}
                </span>
              </div>
              <ProgressBar value={progress} />
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">{member.initial_weight_kg} kg</span>
                <span className={progress > 0 ? 'text-green-400' : 'text-slate-500'}>{progress.toFixed(0)}% completado</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DETALLE DE MIEMBRO (vista interna, sin ruta)
// ═══════════════════════════════════════════════════════════════════════════
function MemberDetail({ memberId, members, allWeighIns, onBack }) {
  const { weighIns, loading } = useWeighIns(memberId)
  const member = members.find((m) => m.id === memberId)

  const sortedWIs = useMemo(
    () => [...weighIns].sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date)),
    [weighIns]
  )

  const chartData = sortedWIs.map((w) => ({
    week: w.week_number,
    peso: w.weight_kg,
  }))

  const streak = useMemo(() => {
    let c = 0
    for (let i = sortedWIs.length - 1; i > 0; i--) {
      if (sortedWIs[i].weight_kg < sortedWIs[i - 1].weight_kg) c++
      else break
    }
    return c
  }, [sortedWIs])

  if (!member) return null

  const latest = sortedWIs.at(-1)
  const currentWeight = latest?.weight_kg ?? member.initial_weight_kg
  const totalLoss = member.initial_weight_kg - currentWeight
  const bmi = calculateBMI(currentWeight, member.height_cm)
  const bmiCat = getBMICategory(bmi)
  const progress = calcGoalProgress(member.initial_weight_kg, currentWeight, member.goal_weight_kg)
  const remaining = currentWeight - member.goal_weight_kg

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1 -ml-1">
          <ArrowLeft size={20} />
        </button>
        <Avatar name={member.name} size="lg" />
        <div>
          <h2 className="text-xl font-bold text-white">{member.name}</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className={bmiCat.color}>{bmiCat.label}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{member.height_cm} cm</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Peso actual', value: `${currentWeight.toFixed(1)} kg`, color: 'text-white' },
          { label: 'Pérdida total', value: `${totalLoss >= 0 ? '−' : '+'}${Math.abs(totalLoss).toFixed(1)} kg`, color: totalLoss > 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'IMC actual', value: bmi.toFixed(1), sub: bmiCat.label, color: bmiCat.color },
          { label: 'Racha bajando', value: `${streak} sem`, sub: streak >= 2 ? '🔥' : streak === 1 ? '✅' : '—', color: streak >= 2 ? 'text-orange-400' : 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            {s.sub && <div className="text-slate-500 text-xs">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Progreso a la meta */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white text-sm font-semibold mb-3">Progreso hacia la meta</h3>
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Inicio: {member.initial_weight_kg} kg</span>
          <span>Meta: {member.goal_weight_kg} kg</span>
        </div>
        <div className="bg-slate-700 rounded-full h-3 mb-2">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">{progress.toFixed(1)}% completado</span>
          <span className={remaining > 0 ? 'text-blue-400' : 'text-green-400'}>
            {remaining > 0 ? `Faltan ${remaining.toFixed(1)} kg` : '¡Meta alcanzada! 🎉'}
          </span>
        </div>
      </div>

      {/* Gráfico individual */}
      {chartData.length >= 2 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white text-sm font-semibold mb-3">Evolución</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tickFormatter={(v) => `S${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-slate-800 border border-slate-600 rounded-xl p-2 text-xs shadow-xl">
                    <p className="text-slate-400 mb-1">Semana {label}</p>
                    <p className="text-white font-bold">{payload[0]?.value?.toFixed(1)} kg</p>
                  </div>
                )
              }} />
              <Line type="monotone" dataKey="peso" stroke={getMemberColor(member.name)} strokeWidth={2.5}
                dot={{ r: 4, fill: getMemberColor(member.name), strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historial */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-white text-sm font-semibold">Historial de pesajes</h3>
        </div>
        {loading ? (
          <div className="text-center py-6 text-slate-500 text-sm">Cargando...</div>
        ) : sortedWIs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Sin pesajes registrados.</div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {[...sortedWIs].reverse().map((w, idx, arr) => {
              const prev = arr[idx + 1]
              const change = prev ? w.weight_kg - prev.weight_kg : null
              const badge = getPerformanceBadge(change)
              const bmiRow = calculateBMI(w.weight_kg, member.height_cm)
              const bmiCatRow = getBMICategory(bmiRow)
              return (
                <div key={w.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{w.weight_kg.toFixed(1)} kg</span>
                        <span className="text-base">{badge.emoji}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>{formatDate(w.weigh_in_date)}</span>
                        <span>•</span><span>Sem {w.week_number}</span>
                        <span>•</span><span className={bmiCatRow.color}>IMC {bmiRow.toFixed(1)}</span>
                      </div>
                    </div>
                    {change !== null && (
                      <span className={`text-sm font-bold ${change < 0 ? 'text-green-400' : change > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                  {w.notes && <p className="text-slate-500 text-xs mt-1 italic">"{w.notes}"</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PÁGINA PÚBLICA — componente raíz
// ═══════════════════════════════════════════════════════════════════════════
export default function PublicPage() {
  const { members, loading: loadingMembers } = useMembers()
  const { weighIns, loading: loadingWeighIns } = useWeighIns()
  const [tab, setTab] = useState('ranking')
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  const handleSelectMember = (id) => {
    setSelectedMemberId(id)
  }

  const handleBack = () => {
    setSelectedMemberId(null)
  }

  const loading = loadingMembers || loadingWeighIns

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <div>
              <span className="font-bold text-white text-base">DisciplineMode</span>
              <div className="flex items-center gap-1 mt-0">
                <Lock size={10} className="text-slate-500" />
                <span className="text-slate-500 text-xs">Solo lectura</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1">
            <Flame size={12} className="text-orange-400" />
            <span className="text-xs text-slate-300 font-medium">Grupo activo</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Cargando datos del grupo...
          </div>
        ) : selectedMemberId ? (
          // Vista de detalle del miembro
          <MemberDetail
            memberId={selectedMemberId}
            members={members}
            allWeighIns={weighIns}
            onBack={handleBack}
          />
        ) : (
          // Vista con tabs
          <div className="space-y-4">
            <Tabs active={tab} onChange={setTab} />

            {tab === 'ranking' && (
              <RankingTab
                members={members}
                weighIns={weighIns}
                onSelectMember={handleSelectMember}
              />
            )}
            {tab === 'graficos' && (
              <GraficosTab members={members} weighIns={weighIns} />
            )}
            {tab === 'miembros' && (
              <MiembrosTab
                members={members}
                weighIns={weighIns}
                onSelectMember={handleSelectMember}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
