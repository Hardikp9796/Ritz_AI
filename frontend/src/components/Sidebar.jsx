import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, TrendingUp, History, Settings } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'POS' },
    { path: '/orders', icon: History, label: 'Orders' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar-nav" data-testid="sidebar">
      <div className="mb-8">
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center font-secondary text-2xl text-white">
          P
        </div>
      </div>
      
      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;