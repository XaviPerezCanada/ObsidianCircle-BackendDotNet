import { HeroSection } from '@/src/components/layout/hero-section'
import { Footer } from '@/src/components/layout/footer'
import { SignForm } from '@/src/components/User/Login/SingForm'
import { RegisterForm } from '@/src/components/User/Login/RegisterForm'

export function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <Footer />
    </main>
  )
}

export function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 pt-24 pb-24">    
      <SignForm />
    </main>
  )
}

export function RegisterPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 pt-24 pb-24">
      <RegisterForm />
    </main>
  )
}

export function ProfilePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-foreground">
        <h2 className="text-xl font-semibold">Zona protegida</h2>
        <p className="text-muted-foreground mt-2">
          Si estás viendo esto, el guard funciona y tienes sesión.
        </p>
      </div>
    </main>
  )
}

