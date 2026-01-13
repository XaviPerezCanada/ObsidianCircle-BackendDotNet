import { type LoginRequest, type RegisterRequest, type AuthResponse } from "./User";

// Contrato que debe cumplir cualquier fuente de datos de autenticación
export interface AuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(userData: RegisterRequest): Promise<AuthResponse>;
}
