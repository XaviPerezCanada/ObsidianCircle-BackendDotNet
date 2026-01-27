import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/src/context/auth-context'
import {  ProtectedRoute, PublicRoute } from '@/src/routes/guards'
import { HomePage, LoginPage, RegisterPage } from '@/src/routes/pages'
import { ProfilePage } from '@/src/pages/profile/profile'
import { AdminDashboard } from '@/src/pages/admin/AdminDashboard'
import { Navbar } from '@/components/navbar'
import { UserDashboard } from './pages/profile/UserDashboard'
import { PaySubscriptionPage } from './pages/payment/payment'
import { Toaster } from '@/components/ui/toaster'


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
        

              {/* <Route element={<AdminRoute />}> */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              {/* </Route> */}
            </Routes>
          </BrowserRouter>
          <Analytics />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App