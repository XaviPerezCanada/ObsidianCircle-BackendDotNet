import { type AuthRepository } from "../domain/AuthRepository";
import { type LoginRequest, type RegisterRequest, type AuthResponse, type User } from "../domain/User";

// Mock de usuarios almacenados en memoria (simula base de datos)
const mockUsers: Array<User & { password: string }> = [
  {
    id: "1",
    email: "xavi@gmail.com",
    name: "Xavier",
    password: "Daw12345",
    token: "mock-token-123"
  }
];

// Implementación con mocks
export class AuthMockRepository implements AuthRepository {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const { password, ...userWithoutPassword } = user;
    const token = `mock-token-${Date.now()}`;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
   
    await new Promise(resolve => setTimeout(resolve, 800));

  
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

   
    const newUser: User & { password: string } = {
      id: String(mockUsers.length + 1),
      email: userData.email,
      name: userData.name,
      password: userData.password,
      token: `mock-token-${Date.now()}`
    };

    mockUsers.push(newUser);

    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token: newUser.token!
    };
  }
}
