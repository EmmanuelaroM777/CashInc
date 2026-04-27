import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Building2, MapPin, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';

const AssetCard = ({ asset, onClick }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  
  const statusColors = {
    activo: 'bg-[var(--status-success)]',
    inactivo: 'bg-[var(--text-muted)]',
    en_mantenimiento: 'bg-[var(--status-warning)]'
  };

  return (
    <div 
      className="glass-panel hover:-translate-y-1 transition-transform duration-300 cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="h-2 w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">{asset.name}</h3>
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white ${statusColors[asset.status] || 'bg-gray-500'}`}>
            {asset.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-2 mb-4 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center">
            <Building2 size={14} className="mr-2" />
            <span className="capitalize">{asset.type}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-2" />
            <span className="truncate">{asset.location || 'Sin ubicación'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Valor Actual</p>
            <p className="font-semibold text-white">{formatCurrency(asset.current_value)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] mb-1">ROI</p>
            <p className={`font-semibold ${asset.roi >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
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
  const navigate = useNavigate();
  const location = useLocation();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    status: 'activo'
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${search}` : '';
      const response = await apiClient.get(`/assets${query}`);
      setAssets(response.data.assets);
    } catch (error) {
      console.error("Error fetching assets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search]);

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
        initial_investment: '', useful_life_years: '', salvage_value: '0', status: 'activo'
      });
    } catch (error) {
      console.error("Error creating asset", error);
      alert(error.response?.data?.detail || "Error al crear activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Activos</h2>
          <p className="text-[var(--text-secondary)]">Administre su infraestructura y propiedades</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar activos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors w-full md:w-64"
            />
          </div>
          
          {user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Plus size={18} className="mr-2" />
              Nuevo Activo
            </Button>
          )}
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <Loader />
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onClick={() => navigate(`/assets/${asset.id}`)} 
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Building2 size={48} className="text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No se encontraron activos</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {search ? 'Intente con otros términos de búsqueda.' : 'Comience agregando su primer activo a la plataforma.'}
          </p>
          {!search && user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)}>Agregar Activo</Button>
          )}
        </div>
      )}

      {/* Create Asset Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Registrar Nuevo Activo"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <Input label="Inversión Inicial ($)" name="initial_investment" type="number" step="0.01" min="0" value={formData.initial_investment} onChange={handleInputChange} required />
            <Input label="Fecha de Adquisición" name="acquisition_date" type="date" value={formData.acquisition_date} onChange={handleInputChange} required />
            
            <Input label="Vida Útil (Años)" name="useful_life_years" type="number" min="1" value={formData.useful_life_years} onChange={handleInputChange} required />
            <Input label="Valor de Salvamento ($)" name="salvage_value" type="number" step="0.01" min="0" value={formData.salvage_value} onChange={handleInputChange} />

            <div className="space-y-1.5 w-full md:col-span-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Estado</label>
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
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Guardar Activo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetsPage;
