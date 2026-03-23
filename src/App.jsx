import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChartPage from './pages/ChartPage'
import MembersPage from './pages/MembersPage'
import MemberDetailPage from './pages/MemberDetailPage'
import RegisterWeighInPage from './pages/RegisterWeighInPage'
import PublicPage from './pages/PublicPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Cargando...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* ── Ruta pública: sin autenticación requerida ── */}
      <Route path="/publico" element={<PublicPage />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/graficos" element={<ChartPage />} />
                <Route path="/miembros" element={<MembersPage />} />
                <Route path="/miembros/:id" element={<MemberDetailPage />} />
                <Route path="/registrar" element={<RegisterWeighInPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
