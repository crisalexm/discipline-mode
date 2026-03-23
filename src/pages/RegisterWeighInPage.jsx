import { useState } from 'react'
import { CheckCircle, Scale } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { useWeighIns } from '../hooks/useWeighIns'
import Avatar from '../components/Avatar'
import { getCurrentWeekNumber, getWeekNumber } from '../lib/utils'

export default function RegisterWeighInPage() {
  const { members } = useMembers()
  const { addWeighIn } = useWeighIns()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    member_id: '',
    weight_kg: '',
    weigh_in_date: today,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const weekPreview = form.weigh_in_date ? getWeekNumber(form.weigh_in_date) : getCurrentWeekNumber()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { data, error } = await addWeighIn({
      member_id: form.member_id,
      weight_kg: parseFloat(form.weight_kg),
      weigh_in_date: form.weigh_in_date,
      notes: form.notes.trim() || null,
    })

    if (error) {
      setError(error.message)
    } else {
      const memberName = members.find((m) => m.id === form.member_id)?.name || ''
      setSuccess(`Peso de ${memberName} registrado exitosamente en Semana ${weekPreview}.`)
      setForm({ member_id: '', weight_kg: '', weigh_in_date: today, notes: '' })
    }
    setLoading(false)
  }

  const selectedMember = members.find((m) => m.id === form.member_id)

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Registrar Peso</h1>
        <p className="text-slate-400 text-sm">Ingresa el pesaje semanal</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member selector */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Miembro</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, member_id: member.id }))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    form.member_id === member.id
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Avatar name={member.name} size="sm" />
                  <span className="text-sm font-medium truncate">{member.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            {members.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-3">
                Agrega miembros primero en la pestaña Miembros.
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Peso (kg)</label>
            <div className="relative">
              <Scale size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={form.weight_kg}
                onChange={(e) => setForm((p) => ({ ...p, weight_kg: e.target.value }))}
                placeholder="94.5"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Fecha del pesaje</label>
            <input
              type="date"
              value={form.weigh_in_date}
              onChange={(e) => setForm((p) => ({ ...p, weigh_in_date: e.target.value }))}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            <p className="text-slate-500 text-xs mt-1">
              Esta fecha corresponde a la <span className="text-blue-400 font-medium">Semana {weekPreview}</span>
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Ej: semana de mucho estrés, viaje..."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg px-3 py-2 text-green-300 text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Preview */}
          {selectedMember && form.weight_kg && (
            <div className="bg-slate-700/50 rounded-xl p-3 text-sm border border-slate-600">
              <p className="text-slate-400 text-xs mb-1">Vista previa</p>
              <div className="flex items-center gap-2">
                <Avatar name={selectedMember.name} size="sm" />
                <div>
                  <span className="text-white font-medium">{selectedMember.name}</span>
                  <span className="text-slate-400 mx-2">→</span>
                  <span className="text-blue-400 font-bold">{parseFloat(form.weight_kg).toFixed(1)} kg</span>
                  <span className="text-slate-500 ml-2 text-xs">Semana {weekPreview}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.member_id}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Guardando...' : 'Registrar peso'}
          </button>
        </form>
      </div>
    </div>
  )
}
