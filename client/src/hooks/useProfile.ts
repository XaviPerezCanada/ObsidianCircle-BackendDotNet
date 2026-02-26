import { useEffect, useState } from 'react'
import { userService, type ProfileUser, type UpdateProfileRequest } from '@/src/services/user.service'

type UseProfileState = {
  profile: ProfileUser | null
  loading: boolean
  error: string | null
}

export function useProfile(enabled: boolean = true) {
  const [state, setState] = useState<UseProfileState>({
    profile: null,
    loading: enabled,
    error: null,
  })

  const loadProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const profile = await userService.getProfile()
      setState({ profile, loading: false, error: null })
    } catch (err: any) {
      const backendDetail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo cargar el perfil.'

      setState(prev => ({ ...prev, loading: false, error: backendDetail }))
    }
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const updated = await userService.updateProfile(data)
      setState({ profile: updated, loading: false, error: null })
      return updated
    } catch (err: any) {
      const backendDetail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo actualizar el perfil.'

      setState(prev => ({ ...prev, loading: false, error: backendDetail }))
      throw err
    }
  }

  useEffect(() => {
    if (!enabled) return
    void loadProfile()
  }, [enabled])

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    reload: loadProfile,
    updateProfile,
  }
}

