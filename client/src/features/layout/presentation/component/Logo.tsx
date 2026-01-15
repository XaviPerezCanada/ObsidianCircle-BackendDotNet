import logo from '../../../../assets/logo/logo.png';

interface LogoProps {
  collapsed?: boolean;
}

export const Logo = ({ collapsed }: LogoProps) => {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <img 
        src={logo} 
        alt="logo" 
        className="w-10 h-10 object-contain rounded-full bg-white p-1 flex-shrink-0" 
      />
      {!collapsed && (
        <h3 className="text-white text-xl font-bold whitespace-nowrap truncate">Obsidian Circle</h3>
      )}
    </div>
  );
};
