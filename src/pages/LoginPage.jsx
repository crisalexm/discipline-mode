import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Revisa tu email para confirmar tu cuenta.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError('Email o contraseña incorrectos.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-white">DisciplineMode</h1>
          <p className="text-slate-400 mt-2 text-sm">Seguimiento de pérdida de peso grupal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <h2 className="text-white font-semibold text-lg mb-5">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 rounded-lg px-3 py-2 text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/40 border border-green-700 rounded-lg px-3 py-2 text-green-300 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-4">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null) }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Grupo WhatsApp • Desde el 09/03/2026
        </p>
      </div>
    </div>
  )
}
