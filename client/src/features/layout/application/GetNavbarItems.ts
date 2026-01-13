import { type NavbarRepository } from "../domain/NavbarRepository";
import { type NavbarItem } from "../domain/NavbarItem";

export class GetNavbarItemsUseCase {
  private repository: NavbarRepository;

  constructor(repository: NavbarRepository) {
    this.repository = repository;
  }

  execute(): Promise<NavbarItem[]> {
   
    return this.repository.getMenuItems();
  }
}