import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/src/context/auth-context'

/**
 * Protege rutas: si NO hay sesión -> redirige a /login
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

/**
 * Protege rutas de admin:
 * - sin sesión -> /login
 * - con sesión pero sin rol ADMIN -> /
 */
export function AdminRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.tipo !== 'ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}

/**
 * Protege rutas públicas (login/register): si YA hay sesión -> redirige a /
 */
export function PublicRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

