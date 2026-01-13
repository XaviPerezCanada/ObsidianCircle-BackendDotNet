
import { useNavbar } from '../hook/useNavbar'; 
import { GetNavbarItemsUseCase } from '../../application/GetNavbarItems';
import { NavbarAPI } from '../../Infraestructure/NavbarAPI';

const navbarRepository = new NavbarAPI();
const getNavbarItemsUseCase = new GetNavbarItemsUseCase(navbarRepository);

export const Navbar = () => {
 
  const { items, loading, error } = useNavbar(getNavbarItemsUseCase);

  if (loading) return <nav>Cargando menú...</nav>;
  if (error) return <nav>Error: {error}</nav>;

  return (
    <nav style={{ 
      padding: '1rem', 
      background: '#ebc3c3',
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <ul style={{ 
        display: 'flex', 
        gap: '20px', 
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.path} style={{ textDecoration: 'none', color: '#333' }}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};