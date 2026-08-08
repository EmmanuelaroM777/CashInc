import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Building2, MapPin, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';

const AssetCard = ({ asset, onClick, t }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  
  const statusColors = {
    activo: 'bg-[var(--status-success)]',
    inactivo: 'bg-[var(--text-muted)]',
    en_mantenimiento: 'bg-[var(--status-warning)]'
  };

  const physicalStateBadges = {
    excelente: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    bueno: 'text-teal-400 bg-teal-500/10 border border-teal-500/20',
    regular: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
    malo: 'text-orange-400 bg-orange-500/10 border border-orange-500/20',
    critico: 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
  };

  return (
    <div 
      className="glass-panel hover:-translate-y-1 transition-transform duration-300 cursor-pointer overflow-hidden group flex flex-col justify-between h-[230px]"
      onClick={onClick}
    >
      <div>
        <div className="h-2 w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"></div>
        <div className="p-5 pb-2">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{asset.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${statusColors[asset.status] || 'bg-gray-500'} whitespace-nowrap`}>
              {asset.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="space-y-1 mb-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Building2 size={13} className="text-[var(--text-muted)]" />
              <span className="capitalize">{asset.type}</span>
              {asset.physical_state && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-medium capitalize ${physicalStateBadges[asset.physical_state]}`}>
                  {asset.physical_state}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[var(--text-muted)]" />
              <span className="truncate">{asset.location || t('assets.noLocation')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-[var(--border-light)] grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{t('assets.currentValue')}</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(asset.current_value)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">ROI</p>
            <p className={`text-sm font-semibold ${asset.roi >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
              {asset.roi}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetsPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 12, total: 0 });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    if (searchQuery !== null) {
      setSearch(searchQuery);
    }
  }, [location.search]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'edificio',
    description: '',
    location: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    initial_investment: '',
    useful_life_years: '',
    salvage_value: '0',
    status: 'activo',
    physical_state: 'excelente',
    brand: '',
    model: '',
    serial_number: ''
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (typeFilter) queryParams.append('type', typeFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      queryParams.append('skip', pagination.skip.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await apiClient.get(`/assets?${queryParams.toString()}`);
      setAssets(response.data.assets);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      console.error("Error fetching assets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPagination(prev => ({ ...prev, skip: 0 })); // Reset page on filter changes
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchAssets();
  }, [search, typeFilter, statusFilter, pagination.skip]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        initial_investment: parseFloat(formData.initial_investment),
        useful_life_years: parseInt(formData.useful_life_years),
        salvage_value: parseFloat(formData.salvage_value),
        acquisition_date: new Date(formData.acquisition_date).toISOString()
      };
      
      await apiClient.post('/assets', payload);
      setIsModalOpen(false);
      fetchAssets();
      // Reset form
      setFormData({
        name: '', type: 'edificio', description: '', location: '',
        acquisition_date: new Date().toISOString().split('T')[0],
        initial_investment: '', useful_life_years: '', salvage_value: '0', status: 'activo',
        physical_state: 'excelente', brand: '', model: '', serial_number: ''
      });
    } catch (error) {
      console.error("Error creating asset", error);
      alert(error.response?.data?.detail || t('assets.errorCreating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && pagination.skip > 0) {
      setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
    } else if (direction === 'next' && pagination.skip + pagination.limit < pagination.total) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('assets.title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('assets.subtitle')}</p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center self-start">
            <Plus size={18} className="mr-2" />
            {t('assets.newAsset')}
          </Button>
        )}
      </div>

      {/* Advanced Filter Panel */}
      <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder={t('assets.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors w-full"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all w-full"
        >
          <option value="">{t('maintenance.allTypes') || 'Todos los Tipos'}</option>
          <option value="edificio">{t('assets.typeBuilding')}</option>
          <option value="instalacion">{t('assets.typeInstallation')}</option>
          <option value="maquinaria">{t('assets.typeMachinery')}</option>
          <option value="equipo">{t('assets.typeEquipment')}</option>
          <option value="proyecto">{t('assets.typeProject')}</option>
          <option value="sucursal">{t('assets.typeBranch')}</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all w-full"
        >
          <option value="">{t('maintenance.allStatuses') || 'Todos los Estados'}</option>
          <option value="activo">{t('assets.statusActive')}</option>
          <option value="en_mantenimiento">{t('assets.statusMaintenance')}</option>
          <option value="inactivo">{t('assets.statusInactive')}</option>
        </select>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <Loader />
      ) : assets.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onClick={() => navigate(`/assets/${asset.id}`)}
                t={t}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-light)]">
              <span className="text-xs text-[var(--text-secondary)]">
                Mostrando {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} activos
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.skip === 0}
                  onClick={() => handlePageChange('prev')}
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] text-white hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="self-center text-sm font-semibold px-3 text-white">
                  Pág. {currentPage} / {totalPages}
                </span>
                <button
                  disabled={pagination.skip + pagination.limit >= pagination.total}
                  onClick={() => handlePageChange('next')}
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] text-white hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Building2 size={48} className="text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">{t('assets.noAssetsFound')}</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {search || typeFilter || statusFilter ? t('assets.tryOtherSearch') : t('assets.addFirstAsset')}
          </p>
          {!search && !typeFilter && !statusFilter && user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)}>{t('assets.addAsset')}</Button>
          )}
        </div>
      )}

      {/* Create Asset Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={t('assets.registerTitle')}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('assets.assetName')} name="name" value={formData.name} onChange={handleInputChange} required />
            
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('assets.assetType')}</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="edificio" className="bg-[var(--bg-secondary)]">{t('assets.typeBuilding')}</option>
                <option value="instalacion" className="bg-[var(--bg-secondary)]">{t('assets.typeInstallation')}</option>
                <option value="maquinaria" className="bg-[var(--bg-secondary)]">{t('assets.typeMachinery')}</option>
                <option value="equipo" className="bg-[var(--bg-secondary)]">{t('assets.typeEquipment')}</option>
                <option value="proyecto" className="bg-[var(--bg-secondary)]">{t('assets.typeProject')}</option>
                <option value="sucursal" className="bg-[var(--bg-secondary)]">{t('assets.typeBranch')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Input label={t('assets.location')} name="location" value={formData.location} onChange={handleInputChange} icon={MapPin} />
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <Input label="Marca" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Ej. Ford, LG" />
              <Input label="Modelo" name="model" value={formData.model} onChange={handleInputChange} placeholder="Ej. F-150, OLED" />
            </div>

            <Input label="Número de Serie" name="serial_number" value={formData.serial_number} onChange={handleInputChange} placeholder="Ej. SN-7812A" />

            <div className="space-y-1.5 w-full">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Estado Físico</label>
              <select name="physical_state" value={formData.physical_state} onChange={handleInputChange} className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="excelente" className="bg-[var(--bg-secondary)]">Excelente (Sin fallos, nuevo)</option>
                <option value="bueno" className="bg-[var(--bg-secondary)]">Bueno (Uso estándar regular)</option>
                <option value="regular" className="bg-[var(--bg-secondary)]">Regular (Desgaste visible)</option>
                <option value="malo" className="bg-[var(--bg-secondary)]">Malo (Requiere reparaciones seguidas)</option>
                <option value="critico" className="bg-[var(--bg-secondary)]">Crítico (Inoperable, cambiar urgente)</option>
              </select>
            </div>

            <Input label={t('assets.initialInvestment')} name="initial_investment" type="number" step="0.01" min="0" value={formData.initial_investment} onChange={handleInputChange} required />
            <Input label={t('assets.acquisitionDate')} name="acquisition_date" type="date" value={formData.acquisition_date} onChange={handleInputChange} required />
            
            <Input label={t('assets.usefulLife')} name="useful_life_years" type="number" min="1" value={formData.useful_life_years} onChange={handleInputChange} required />
            <Input label={t('assets.salvageValue')} name="salvage_value" type="number" step="0.01" min="0" value={formData.salvage_value} onChange={handleInputChange} />

            <div className="space-y-1.5 w-full md:col-span-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('assets.status')}</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="activo" className="bg-[var(--bg-secondary)]">{t('assets.statusActive')}</option>
                <option value="en_mantenimiento" className="bg-[var(--bg-secondary)]">{t('assets.statusMaintenance')}</option>
                <option value="inactivo" className="bg-[var(--bg-secondary)]">{t('assets.statusInactive')}</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('assets.description')}</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('assets.cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting}>{t('assets.saveAsset')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetsPage;
