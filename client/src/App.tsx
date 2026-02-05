import { lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/src/components/layout/theme-provider'
import { AuthProvider } from '@/src/context/auth-context'
import { ProtectedRoute, PublicRoute } from '@/src/routes/guards'
import { Navbar } from '@/src/components/layout/navbar'
import { Toaster } from '@/src/components/ui/toaster'
import { Skeleton } from '@/src/components/ui/skeleton'

// Lazy: solo se cargan cuando se visita la ruta
const HomePage = lazy(() =>
  import('@/src/routes/pages').then(m => ({ default: m.HomePage }))
)
const LoginPage = lazy(() =>
  import('@/src/routes/pages').then(m => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@/src/routes/pages').then(m => ({ default: m.RegisterPage }))
)
const ProfilePage = lazy(() =>
  import('@/src/pages/profile/profile').then(m => ({ default: m.ProfilePage }))
)
const UserDashboard = lazy(() =>
  import('@/src/pages/profile/UserDashboard').then(m => ({ default: m.UserDashboard }))
)
const PaySubscriptionPage = lazy(() =>
  import('@/src/pages/payment/payment').then(m => ({ default: m.PaySubscriptionPage }))
)
const AdminDashboard = lazy(() =>
  import('@/src/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
)
const Shop = lazy(() => import('./pages/shop/shop'))

/** Fallback genérico mientras carga cualquier página lazy */
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="font-sans antialiased"> 
          <BrowserRouter>
            <Navbar />
            <main className="pt-16 min-h-screen">
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />

                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/pay-subscription" element={<PaySubscriptionPage />} />
                  </Route>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                  </Route>

                  <Route path="/shop" element={<Shop />} />

                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </Routes>
              </Suspense>
            </main>
          </BrowserRouter>
          <Analytics />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App