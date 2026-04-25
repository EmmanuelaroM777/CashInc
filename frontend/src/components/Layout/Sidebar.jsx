import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CircleDollarSign, 
  BarChart3, 
  Bell, 
  LogOut 
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Activos', path: '/assets', icon: Building2 },
    { name: 'Finanzas', path: '/finances', icon: CircleDollarSign },
    { name: 'Reportes', path: '/reports', icon: BarChart3 },
    { name: 'Alertas', path: '/alerts', icon: Bell },
  ];

  return (
    <aside className="w-full flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border-light)] z-40">
      {/* Logo */}
      <Link to="/" className="h-16 flex items-center px-6 border-b border-[var(--border-light)] hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="CashInc Logo" className="w-9 h-9 object-contain mr-3 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--text-secondary)]">
          CashInc
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] font-medium border border-[var(--accent-primary)] border-opacity-20 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-white border border-transparent'
                }
              `}
            >
              <Icon size={20} className="mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-[var(--border-light)]">
        <div className="flex items-center px-4 py-3 bg-[var(--bg-primary)] rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-tertiary)] flex items-center justify-center text-white font-bold mr-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        {user?.role === 'admin' && user?.company_code && (
          <div className="mb-3 px-4 py-2 bg-[var(--bg-glass)] border border-[var(--accent-primary)] border-opacity-30 rounded-lg text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">Código de Empresa</p>
            <p className="text-sm font-mono font-bold tracking-widest text-[var(--accent-primary)] select-all">
              {user.company_code}
            </p>
          </div>
        )}

        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-[var(--status-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
