// Entidad de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
}

// DTOs para las operaciones
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
