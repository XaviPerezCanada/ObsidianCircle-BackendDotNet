import { useAuth } from '@/src/context/auth-context'
import type { LoginRequest, RegisterRequest } from '@/src/services/auth.service'

//* Hooks para autenticación basicas

export function useRegister() {
  const { register } = useAuth()
  return {
    register: (data: RegisterRequest) => register(data),
  }
}

export function useLogin() {
  const { login } = useAuth()
  return {
    login: (data: LoginRequest) => login(data),
  }
}
  