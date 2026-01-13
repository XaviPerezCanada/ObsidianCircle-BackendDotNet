import { type NavbarItem } from "./NavbarItem";

// El contrato que debe cumplir cualquier fuente de datos
export interface NavbarRepository {
  getMenuItems(): Promise<NavbarItem[]>;
}