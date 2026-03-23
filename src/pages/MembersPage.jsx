import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Target, Ruler, Weight } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import Avatar from '../components/Avatar'
import { calculateBMI, getBMICategory, calcGoalProgress } from '../lib/utils'

function AddMemberModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', height_cm: '', initial_weight_kg: '', goal_weight_kg: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await onAdd({
      name: form.name.trim(),
      height_cm: parseFloat(form.height_cm),
      initial_weight_kg: parseFloat(form.initial_weight_kg),
      goal_weight_kg: parseFloat(form.goal_weight_kg),
    })
    if (error) setError(error.message)
    else onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Agregar miembro</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {[
            { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', icon: null },
            { key: 'height_cm', label: 'Altura (cm)', type: 'number', placeholder: '175', icon: Ruler },
            { key: 'initial_weight_kg', label: 'Peso inicial (kg)', type: 'number', placeholder: '95.5', icon: Weight },
            { key: 'goal_weight_kg', label: 'Meta de peso (kg)', type: 'number', placeholder: '80', icon: Target },
          ].map(({ key, label, type, placeholder, icon: Icon }) => (
            <div key={key}>
              <label className="block text-xs text-slate-400 mb-1">{label}</label>
              <div className="relative">
                {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
                <input
                  type={type}
                  step={type === 'number' ? '0.1' : undefined}
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  className={`w-full bg-slate-700 border border-slate-600 rounded-lg py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
                />
              </div>
            </div>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
              {loading ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MembersPage() {
  const { members, addMember } = useMembers()
  const { weighIns } = useWeighIns()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Miembros</h1>
          <p className="text-slate-400 text-sm">{members.length} participantes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className="grid gap-3">
        {members.map((member) => {
          const memberWeighIns = weighIns
            .filter((w) => w.member_id === member.id)
            .sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date))
          const latest = memberWeighIns.at(-1)
          const currentWeight = latest?.weight_kg ?? member.initial_weight_kg
          const bmi = calculateBMI(currentWeight, member.height_cm)
          const bmiCat = getBMICategory(bmi)
          const progress = calcGoalProgress(member.initial_weight_kg, currentWeight, member.goal_weight_kg)
          const remaining = currentWeight - member.goal_weight_kg

          return (
            <div
              key={member.id}
              onClick={() => navigate(`/miembros/${member.id}`)}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-blue-600/50 hover:bg-slate-750 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={member.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium ${bmiCat.color}`}>{bmiCat.label}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-xs">IMC {bmi.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{currentWeight.toFixed(1)} kg</div>
                  <div className="text-slate-500 text-xs">{member.height_cm} cm</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Meta: {member.goal_weight_kg} kg</span>
                  <span className="text-slate-400">{remaining > 0 ? `Faltan ${remaining.toFixed(1)} kg` : '¡Meta alcanzada! 🎉'}</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{member.initial_weight_kg} kg</span>
                  <span className={progress > 0 ? 'text-green-400' : 'text-slate-500'}>{progress.toFixed(0)}% completado</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">👥</p>
          <p>No hay miembros todavía.</p>
          <p className="text-sm mt-1">Agrega el primer participante.</p>
        </div>
      )}

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} onAdd={addMember} />}
    </div>
  )
}
