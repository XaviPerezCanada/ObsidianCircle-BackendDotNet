import { Menu as AntMenu } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined, LogoutOutlined, CalendarOutlined } from '@ant-design/icons';

interface MenuProps {
  collapsed: boolean;
}

//Faltará agregar el es autentificated para que se muestre el menu de cerrar sesión.

export const Menu = ({ collapsed }: MenuProps) => {
  return (
    <AntMenu 
      theme="dark" 
      className="text-white w-full" 
      style={{ background: '#141414', border: 'none' }}
      mode="inline"
      inlineCollapsed={collapsed}
    >
      <AntMenu.Item key="1" icon={<HomeOutlined />} title={collapsed ? 'Inicio' : undefined}>
        {!collapsed && 'Inicio'}
      </AntMenu.Item>
      <AntMenu.Item key="2" icon={<UserOutlined />} title={collapsed ? 'Perfil' : undefined}>
        {!collapsed && 'Perfil'}
      </AntMenu.Item>
      <AntMenu.Item key="3" icon={<CalendarOutlined />} title={collapsed ? 'Reservas' : undefined}>
        {!collapsed && 'Reservas'}
      </AntMenu.Item>
      <AntMenu.Item key="4" icon={<SettingOutlined />} title={collapsed ? 'Configuración' : undefined}>
        {!collapsed && 'Configuración'}
      </AntMenu.Item>
      <AntMenu.Item key="5" icon={<LogoutOutlined />} title={collapsed ? 'Cerrar sesión' : undefined}>
        {!collapsed && 'Cerrar sesión'}
      </AntMenu.Item>
    </AntMenu>
  );
};
