import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import GlowSearch from '../UI/GlowSearch';
import apiClient from '../../api/client';

const Header = ({ onMenuClick }) => {
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        await apiClient.post('/alerts/check-depreciation'); // Generate alerts if needed
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
    if (path === '/dashboard') return t('header.titleDashboard');
    if (path.startsWith('/assets/')) return t('header.titleAssets') + ' ' + t('header.detail');
    if (path.startsWith('/assets')) return t('header.titleAssets');
    if (path.startsWith('/finances')) return t('header.titleFinances');
    if (path.startsWith('/reports')) return t('header.titleReports');
    if (path.startsWith('/alerts')) return t('header.titleAlerts');
    if (path.startsWith('/settings')) return t('header.titleSettings');
    if (path.startsWith('/premium')) return 'Premium';
    return t('header.titleDefault');
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-[var(--bg-secondary)] border-b border-[var(--border-light)] sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-[var(--text-secondary)] hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Animated Search Bar - hidden on small screens */}
        <div className="hidden md:block">
          <GlowSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/assets?search=${searchQuery}`);
              }
            }}
            placeholder={t('header.searchPlaceholder')}
          />
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--bg-primary)]"
        >
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
