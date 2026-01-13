import {type NavbarRepository } from "../domain/NavbarRepository";
import {type NavbarItem } from "../domain/NavbarItem";

// Implementación concreta
export class NavbarAPI implements NavbarRepository {
  async getMenuItems(): Promise<NavbarItem[]> {
    

    return new Promise((resolve) => {
      setTimeout(() => {    
        resolve([
          { id: '1', label: 'Inicio', path: '/home' },
          { id: '2', label: 'Reservas', path: '/reservas' },
          { id: '3', label: 'Contacto', path: '/contact' },
          { id: '4', label: 'Perfil', path: '/profile' }
        ]);
      }, 500);
    });
  }
}