import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  Activity, 
  Trash2, 
  Edit, 
  Wrench, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Sparkles,
  User
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [activeTab, setActiveTab] = useState('maintenance'); // 'maintenance', 'ai', 'depr'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'edificio', description: '', location: '',
    useful_life_years: '', salvage_value: '0', status: 'activo',
    physical_state: 'excelente', brand: '', model: '', serial_number: ''
  });

  const handleEditClick = () => {
    setFormData({
      name: asset.name,
      type: asset.type,
      description: asset.description || '',
      location: asset.location || '',
      useful_life_years: asset.useful_life_years,
      salvage_value: asset.salvage_value,
      status: asset.status,
      physical_state: asset.physical_state || 'excelente',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || ''
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        useful_life_years: parseInt(formData.useful_life_years),
        salvage_value: parseFloat(formData.salvage_value)
      };
      
      const response = await apiClient.put(`/assets/${id}`, payload);
      setAsset(response.data);
      setIsEditModalOpen(false);
      
      // Reload everything to keep states consistent
      fetchAssetAndRelated();
    } catch (error) {
      console.error("Error updating asset", error);
      alert(error.response?.data?.detail || "Error al actualizar activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/assets/${id}`);
      navigate('/assets');
    } catch (error) {
      console.error("Error deleting asset", error);
      alert(error.response?.data?.detail || "Error al eliminar activo");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const fetchAssetAndRelated = async () => {
    try {
      setLoading(true);
      const [assetRes, maintRes] = await Promise.all([
        apiClient.get(`/assets/${id}`),
        apiClient.get(`/maintenance?asset_id=${id}`)
      ]);
      setAsset(assetRes.data);
      setMaintenances(maintRes.data.maintenances);
      
      // Fetch AI prediction details
      try {
        const aiRes = await apiClient.get(`/ai/predictive/${id}`);
        setAiData(aiRes.data);
      } catch (aiErr) {
        console.error("Error fetching AI predictions", aiErr);
      }
    } catch (error) {
      console.error("Error fetching asset details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetAndRelated();
  }, [id]);

  if (loading) return <Loader />;
  if (!asset) return <div className="text-center p-8 text-[var(--text-primary)]">Activo no encontrado.</div>;

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  // Generate standard double declining depreciation data points for standard Recharts view
  const generateDepreciationData = () => {
    const data = [];
    const yearsElapsed = (new Date() - new Date(asset.acquisition_date)) / (1000 * 60 * 60 * 24 * 365.25);
    const totalYears = Math.max(asset.useful_life_years, Math.ceil(yearsElapsed));
    
    let currentValue = asset.initial_investment;
    const rate = 2.0 / asset.useful_life_years;

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

  const physicalStateBadges = {
    excelente: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    bueno: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    regular: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    malo: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    critico: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
            <Button variant="secondary" className="flex items-center" onClick={handleEditClick}>
              <Edit size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="danger" className="flex items-center" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={16} className="mr-2" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Financial Summary */}
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

          {/* Technical and Physical details */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-white mb-4">Detalles Técnicos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Estado Físico:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${physicalStateBadges[asset.physical_state || 'excelente']}`}>
                  {asset.physical_state || 'excelente'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Marca / Modelo:</span>
                <span className="font-medium text-white">
                  {(asset.brand || asset.model) ? `${asset.brand} ${asset.model}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Nº de Serie:</span>
                <span className="font-medium text-white">{asset.serial_number || 'N/A'}</span>
              </div>
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
              <div className="pt-3 border-t border-[var(--border-light)]">
                <span className="text-[var(--text-secondary)] block mb-1">Descripción:</span>
                <p className="text-white text-sm">{asset.description || 'Sin descripción detallada.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interactive Section (Projections, Maintenance, Depr) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 flex flex-col h-full min-h-[500px]">
            {/* Tabs Selector */}
            <div className="flex gap-6 border-b border-[var(--border-light)] pb-3 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`pb-2 text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'maintenance' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
              >
                <Wrench size={16} />
                Historial de Mantenimientos ({maintenances.length})
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`pb-2 text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'ai' ? 'text-[var(--accent-tertiary)] border-b-2 border-[var(--accent-tertiary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
              >
                <Sparkles size={16} className="text-purple-400" />
                Predicciones de IA (EMAI)
              </button>
              <button
                onClick={() => setActiveTab('depr')}
                className={`pb-2 text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'depr' ? 'text-[var(--accent-secondary)] border-b-2 border-[var(--accent-secondary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
              >
                <Activity size={16} />
                Gráfico de Depreciación
              </button>
            </div>

            {/* TAB CONTENT: MAINTENANCE */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4 flex-1 animate-fade-in">
                {maintenances.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {maintenances.map((m) => (
                      <div 
                        key={m.id} 
                        className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[rgba(255,255,255,0.15)] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${m.type === 'preventivo' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                              {m.type}
                            </span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${m.status === 'completado' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                              {m.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white">{m.title}</h4>
                          <p className="text-xs text-[var(--text-secondary)]">{m.description || 'Sin notas descriptivas.'}</p>
                          <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] pt-1">
                            <span className="flex items-center gap-1"><User size={12} /> {m.responsible}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(m.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-right sm:self-center">
                          <p className="text-xs text-[var(--text-muted)]">Costo Final</p>
                          <p className="font-bold text-white">
                            {m.status === 'completado' ? formatCurrency(m.actual_cost) : formatCurrency(m.estimated_cost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                    <Wrench size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No se han registrado mantenimientos preventivos o correctivos.</p>
                    <Button onClick={() => navigate('/maintenance')} variant="secondary" className="mt-4">
                      Ir a Cronogramas
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: AI PREDICTIONS */}
            {activeTab === 'ai' && (
              <div className="space-y-6 flex-1 animate-fade-in">
                {aiData ? (
                  <div className="space-y-6">
                    {/* Intelligent Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(139,92,246,0.2)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu className="text-purple-400" size={20} />
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Recomendaciones de EMAI (IA)</h4>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
                        {aiData.recommendation}
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-xs">
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">Factor de Desgaste</p>
                          <p className="font-bold text-white text-lg">{aiData.wear_multiplier}x</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">Vida Útil Restante Estimada</p>
                          <p className="font-bold text-white text-lg">{aiData.predicted_replacement_year} años</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">ROI Esperado</p>
                          <p className={`font-bold text-lg ${aiData.current_roi >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
                            {aiData.current_roi}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Projections Chart */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Proyección de Costos de Mantenimiento vs. Valor Residual</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={aiData.projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="year" stroke="var(--text-muted)" tickFormatter={(year) => `Año ${year}`} />
                            <YAxis yAxisId="left" stroke="var(--text-muted)" tickFormatter={(v) => `$${v/1000}k`} />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tickFormatter={(v) => `$${v}`} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                              itemStyle={{ color: 'var(--text-primary)' }}
                              formatter={(value, name) => [formatCurrency(value), name === 'projected_value' ? 'Valor Proyectado' : 'Mantenimiento Anual Est.']}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar yAxisId="left" dataKey="projected_value" name="Valor Residual Libro" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="estimated_maintenance_cost" name="Mantenimiento Est." fill="var(--accent-tertiary)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-[var(--text-muted)]">
                    <Clock className="mb-2 animate-pulse" size={24} />
                    <p className="text-sm">Generando proyecciones y análisis predictivos por IA...</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DEPRECIATION */}
            {activeTab === 'depr' && (
              <div className="space-y-4 flex-1 animate-fade-in">
                <div className="h-[320px] w-full">
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
            )}
          </div>
        </div>
      </div>

      {/* Edit Asset Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Editar Activo"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del Activo" name="name" value={formData.name} onChange={handleInputChange} required />
            
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo de Activo</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="edificio" className="bg-[var(--bg-secondary)]">Edificio</option>
                <option value="instalacion" className="bg-[var(--bg-secondary)]">Instalación</option>
                <option value="maquinaria" className="bg-[var(--bg-secondary)]">Maquinaria</option>
                <option value="equipo" className="bg-[var(--bg-secondary)]">Equipo</option>
                <option value="proyecto" className="bg-[var(--bg-secondary)]">Proyecto Constructivo</option>
                <option value="sucursal" className="bg-[var(--bg-secondary)]">Sucursal</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Input label="Ubicación" name="location" value={formData.location} onChange={handleInputChange} icon={MapPin} />
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <Input label="Marca" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Ej. Caterpillar" />
              <Input label="Modelo" name="model" value={formData.model} onChange={handleInputChange} placeholder="Ej. D8T" />
            </div>

            <Input label="Número de Serie" name="serial_number" value={formData.serial_number} onChange={handleInputChange} placeholder="Ej. SN-8712398" />
            
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Estado Físico</label>
              <select name="physical_state" value={formData.physical_state} onChange={handleInputChange} className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="excelente" className="bg-[var(--bg-secondary)]">Excelente (Sin fallos, nuevo)</option>
                <option value="bueno" className="bg-[var(--bg-secondary)]">Bueno (Uso estándar regular)</option>
                <option value="regular" className="bg-[var(--bg-secondary)]">Regular (Desgaste visible)</option>
                <option value="malo" className="bg-[var(--bg-secondary)]">Malo (Requiere reparaciones seguidas)</option>
                <option value="critico" className="bg-[var(--bg-secondary)]">Crítico (Inoperable, cambiar urgente)</option>
              </select>
            </div>

            <Input label="Vida Útil (Años)" name="useful_life_years" type="number" min="1" value={formData.useful_life_years} onChange={handleInputChange} required />
            <Input label="Valor de Salvamento ($)" name="salvage_value" type="number" step="0.01" min="0" value={formData.salvage_value} onChange={handleInputChange} />

            <div className="space-y-1.5 w-full md:col-span-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Estado de Operación</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="activo" className="bg-[var(--bg-secondary)]">Activo</option>
                <option value="en_mantenimiento" className="bg-[var(--bg-secondary)]">En Mantenimiento</option>
                <option value="inactivo" className="bg-[var(--bg-secondary)]">Inactivo</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Descripción</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="glass-panel p-8 max-w-sm w-full mx-4 border border-[rgba(255,255,255,0.1)] shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'rgba(15,17,26,0.95)' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-[var(--status-danger)]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">¿Eliminar este activo?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Esta acción no se puede deshacer. Se eliminarán todos los datos, transacciones y registros asociados a este activo.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[var(--status-danger)] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailPage;
