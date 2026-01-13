import { type AuthRepository } from "../domain/AuthRepository";
import { type LoginRequest, type AuthResponse } from "../domain/User";

export class LoginUseCase {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(credentials: LoginRequest): Promise<AuthResponse> {
    // Validaciones básicas
    if (!credentials.email || !credentials.password) {
      throw new Error("Email y contraseña son requeridos");
    }

    if (!credentials.email.includes("@")) {
      throw new Error("Email inválido");
    }

    return await this.repository.login(credentials);
  }
}
