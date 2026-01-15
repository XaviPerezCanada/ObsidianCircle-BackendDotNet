import { useState } from 'react';
import { Logo } from './Logo';
import { Menu } from './Menu';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`h-screen bg-[#141414] text-white flex flex-col sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-700 w-full">
        <Logo collapsed={collapsed} />
       
      </div>
      <div className="flex-1 w-full">
      <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <MenuUnfoldOutlined className="text-white text-lg" />
          ) : (
            <MenuFoldOutlined className="text-white text-lg" />
          )}
        </button>
        <Menu collapsed={collapsed} />
      </div>
    </aside>
  );
};