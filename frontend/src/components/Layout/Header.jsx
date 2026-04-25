import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import apiClient from '../../api/client';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const response = await apiClient.get('/alerts/count');
        setAlertCount(response.data.count);
      } catch (error) {
        console.error("Error fetching alerts", error);
      }
    };
    fetchAlertCount();
  }, [location.pathname]); // Refresh count on navigation

  // Map paths to titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/assets/')) return 'Detalle de Activo';
    if (path.startsWith('/assets')) return 'Gestión de Activos';
    if (path.startsWith('/finances')) return 'Control Financiero';
    if (path.startsWith('/reports')) return 'Reportes';
    if (path.startsWith('/alerts')) return 'Centro de Alertas';
    return 'CashInc';
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-[var(--bg-secondary)] border-b border-[var(--border-light)] sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-[var(--text-secondary)] hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar - hidden on small screens */}
        <div className="hidden md:flex relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 bg-[var(--bg-primary)] border border-[var(--border-light)] text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--bg-primary)]">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-danger)] text-[10px] font-bold text-white shadow-glow animate-pulse">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
