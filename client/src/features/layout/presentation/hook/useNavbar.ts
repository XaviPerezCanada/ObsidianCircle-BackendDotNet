import { useState, useEffect } from 'react';
import { type NavbarItem } from '../../domain/NavbarItem';
import { GetNavbarItemsUseCase } from '../../application/GetNavbarItems';

// Recibimos el caso de uso para mantener el hook desacoplado
export const useNavbar = (getNavbarItemsUseCase: GetNavbarItemsUseCase) => {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getNavbarItemsUseCase.execute();
        setItems(data);
      } catch (err) {
        setError('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [getNavbarItemsUseCase]);

  return { items, loading, error };
};