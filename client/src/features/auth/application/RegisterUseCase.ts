import { type AuthRepository } from "../domain/AuthRepository";
import { type RegisterRequest, type AuthResponse } from "../domain/User";

export class RegisterUseCase {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(userData: RegisterRequest): Promise<AuthResponse> {
    // Validaciones básicas
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error("Todos los campos son requeridos");
    }

    if (!userData.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (userData.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    if (userData.name.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    return await this.repository.register(userData);
  }
}
