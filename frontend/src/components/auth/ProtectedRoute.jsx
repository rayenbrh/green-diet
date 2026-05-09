import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center bg-cream">
        <div
          className="h-10 w-10 animate-pulse rounded-full bg-[rgba(74,124,89,0.2)]"
          aria-hidden
        />
        <p className="sr-only">Chargement de votre session…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  return children
}
