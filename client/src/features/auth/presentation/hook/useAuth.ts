import { useState } from 'react';
import { type LoginRequest, type RegisterRequest, type AuthResponse } from '../../domain/User';
import { LoginUseCase } from '../../application/LoginUseCase';
import { RegisterUseCase } from '../../application/RegisterUseCase';

export const useAuth = (
  loginUseCase: LoginUseCase,
  registerUseCase: RegisterUseCase
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResponse | null>(null);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginUseCase.execute(credentials);
      setUser(response);
      // Guardar token en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerUseCase.execute(userData);
      setUser(response);
      // Guardar token en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
};
