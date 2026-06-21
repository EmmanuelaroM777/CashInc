import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CircleDollarSign, 
  BarChart3, 
  Bell, 
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const navItems = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.assets'), path: '/assets', icon: Building2 },
    { name: t('sidebar.finances'), path: '/finances', icon: CircleDollarSign },
    { name: t('sidebar.reports'), path: '/reports', icon: BarChart3 },
    { name: t('sidebar.alerts'), path: '/alerts', icon: Bell },
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-full flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border-light)] z-40">
      {/* Logo */}
      <Link to="/" className="h-16 flex items-center px-6 border-b border-[var(--border-light)] hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="CashInc Logo" className="w-9 h-9 object-contain mr-3 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
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
                flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden
                ${isActive 
                  ? 'text-[var(--text-primary)] font-medium bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-transparent border-l-4 border-[var(--accent-primary)] shadow-[-10px_0_20px_-10px_rgba(59,130,246,0.5)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)] border-l-4 border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-5 blur-xl"></div>
                  )}
                </>
              )}
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
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        {user?.role === 'admin' && user?.company_code && (
          <div className="mb-3 px-4 py-2 bg-[var(--bg-glass)] border border-[var(--accent-primary)] border-opacity-30 rounded-lg text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">{t('sidebar.companyCode')}</p>
            <p className="text-sm font-mono font-bold tracking-widest text-[var(--accent-primary)] select-all">
              {user.company_code}
            </p>
          </div>
        )}

        <Link 
          to="/premium"
          className="flex items-center justify-center w-full px-4 py-2 mb-3 text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent-tertiary)] to-[var(--accent-primary)] hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] rounded-lg transition-all"
        >
          <Sparkles size={16} className="mr-2" />
          {t('sidebar.upgrade')}
        </Link>

        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-[var(--status-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
