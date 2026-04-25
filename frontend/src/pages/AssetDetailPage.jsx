import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Calendar, Activity, Trash2, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await apiClient.get(`/assets/${id}`);
        setAsset(response.data);
      } catch (error) {
        console.error("Error fetching asset details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading) return <Loader />;
  if (!asset) return <div className="text-center p-8">Activo no encontrado.</div>;

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  // Generate depreciation data points
  const generateDepreciationData = () => {
    const data = [];
    const yearsElapsed = (new Date() - new Date(asset.acquisition_date)) / (1000 * 60 * 60 * 24 * 365.25);
    const totalYears = Math.max(asset.useful_life_years, Math.ceil(yearsElapsed));
    
    let currentValue = asset.initial_investment;
    const rate = 2.0 / asset.useful_life_years; // Double declining rate

    data.push({ year: 0, value: currentValue });
    
    for (let i = 1; i <= totalYears; i++) {
      let dep = currentValue * rate;
      if (currentValue - dep < asset.salvage_value) {
        dep = currentValue - asset.salvage_value;
      }
      currentValue = Math.max(currentValue - dep, asset.salvage_value);
      data.push({ year: i, value: currentValue });
    }
    return data;
  };

  const statusColors = {
    activo: 'bg-[var(--status-success)]',
    inactivo: 'bg-[var(--text-muted)]',
    en_mantenimiento: 'bg-[var(--status-warning)]'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/assets')}
            className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{asset.name}</h2>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white ${statusColors[asset.status] || 'bg-gray-500'}`}>
                {asset.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center capitalize"><Building2 size={14} className="mr-1" /> {asset.type}</span>
              <span className="flex items-center"><MapPin size={14} className="mr-1" /> {asset.location || 'Sin ubicación'}</span>
              <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(asset.acquisition_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex items-center">
              <Edit size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="danger" className="flex items-center">
              <Trash2 size={16} className="mr-2" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-white mb-4">Resumen Financiero</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Inversión Inicial</p>
                <p className="text-xl font-bold text-white">{formatCurrency(asset.initial_investment)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Valor Actual en Libros</p>
                <p className="text-xl font-bold text-[var(--accent-primary)]">{formatCurrency(asset.current_value)}</p>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)]">
                <p className="text-sm text-[var(--text-secondary)] mb-1">Depreciación Acumulada</p>
                <p className="text-xl font-bold text-[var(--status-warning)]">{formatCurrency(asset.accumulated_depreciation)}</p>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Gastos Totales</p>
                  <p className="font-bold text-[var(--status-danger)]">{formatCurrency(asset.total_maintenance_cost + asset.total_operating_cost)}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">ROI</p>
                  <p className={`font-bold ${asset.roi >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
                    {asset.roi}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-white mb-4">Detalles Técnicos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Vida Útil Estimada:</span>
                <span className="font-medium text-white">{asset.useful_life_years} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Valor de Salvamento:</span>
                <span className="font-medium text-white">{formatCurrency(asset.salvage_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">ID Sistema:</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">{asset.id}</span>
              </div>
              <div className="pt-3">
                <span className="text-[var(--text-secondary)] block mb-1">Descripción:</span>
                <p className="text-white text-sm">{asset.description || 'Sin descripción detallada.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-white mb-4">Proyección de Depreciación</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateDepreciationData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent-primary)' }}
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Año: ${label}`}
                  />
                  <Line type="monotone" dataKey="value" name="Valor en Libros" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-secondary)', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px]">
             <Activity size={48} className="text-[var(--text-muted)] mb-4" />
             <h3 className="text-lg font-medium text-white mb-2">Transacciones Recientes</h3>
             <p className="text-[var(--text-secondary)] mb-4 text-center">Para ver y registrar gastos o ingresos de este activo, diríjase a la sección de Finanzas.</p>
             <Button onClick={() => navigate('/finances')} variant="secondary">Ir a Finanzas</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
