import React, { useState, useEffect, useContext } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import apiClient from '../api/client';
import Loader from '../components/UI/Loader';
import { AuthContext } from '../context/AuthContext';

const AlertsPage = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error("Error fetching alerts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDismiss = async (alertId) => {
    if (user?.role !== 'admin') return;
    try {
      await apiClient.put(`/alerts/${alertId}/dismiss`);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error("Error dismissing alert", error);
    }
  };

  const severityStyles = {
    alta: 'border-[var(--status-danger)] bg-[rgba(239,68,68,0.1)] text-[var(--status-danger)]',
    media: 'border-[var(--status-warning)] bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)]',
    baja: 'border-[var(--status-info)] bg-[rgba(59,130,246,0.1)] text-[var(--status-info)]'
  };

  const severityIcons = {
    alta: AlertTriangle,
    media: Info,
    baja: CheckCircle
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Bell className="mr-2" size={24} />
            Centro de Alertas
          </h2>
          <p className="text-[var(--text-secondary)]">Notificaciones y avisos de control financiero</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {alerts.length > 0 ? (
          <div className="divide-y divide-[var(--border-light)]">
            {alerts.map(alert => {
              const Icon = severityIcons[alert.severity] || Info;
              const style = severityStyles[alert.severity] || severityStyles.baja;
              
              return (
                <div key={alert.id} className="p-6 hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-start justify-between group">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full border mr-4 ${style}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {alert.type.replace('_', ' ').toUpperCase()}
                        {alert.asset_name && <span className="ml-2 text-sm text-[var(--text-secondary)] font-normal">en {alert.asset_name}</span>}
                      </h4>
                      <p className="text-[var(--text-secondary)] text-sm">{alert.message}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-2">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDismiss(alert.id)}
                      className="text-[var(--text-muted)] hover:text-white p-2 transition-colors opacity-0 group-hover:opacity-100"
                      title="Descartar"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center text-[var(--text-muted)]">
            <CheckCircle size={48} className="mb-4 text-[var(--status-success)] opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Todo en orden</h3>
            <p>No tiene alertas activas en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
