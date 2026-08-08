import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';

const MaintenancePage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 15, total: 0 });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedMaint, setSelectedMaint] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    asset_id: '',
    type: 'preventivo',
    title: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    responsible: '',
    estimated_cost: ''
  });

  const [updateFormData, setUpdateFormData] = useState({
    status: 'pendiente',
    actual_cost: '',
    notes: '',
    title: '',
    description: '',
    responsible: '',
    estimated_cost: '',
    scheduled_date: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (selectedAssetFilter) queryParams.append('asset_id', selectedAssetFilter);
      queryParams.append('skip', pagination.skip.toString());
      queryParams.append('limit', pagination.limit.toString());

      const [maintRes, assetsRes] = await Promise.all([
        apiClient.get(`/maintenance?${queryParams.toString()}`),
        apiClient.get('/assets')
      ]);

      let filteredMaints = maintRes.data.maintenances;
      if (typeFilter) {
        filteredMaints = filteredMaints.filter(m => m.type === typeFilter);
      }

      setMaintenances(filteredMaints);
      setAssets(assetsRes.data.assets);
      setPagination(prev => ({ ...prev, total: maintRes.data.total }));
    } catch (error) {
      console.error("Error fetching maintenance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, typeFilter, selectedAssetFilter, pagination.skip]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        estimated_cost: parseFloat(formData.estimated_cost || 0),
        scheduled_date: new Date(formData.scheduled_date).toISOString()
      };
      await apiClient.post('/maintenance', payload);
      setIsCreateModalOpen(false);
      fetchData();
      setFormData({
        asset_id: '',
        type: 'preventivo',
        title: '',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        responsible: '',
        estimated_cost: ''
      });
    } catch (error) {
      console.error("Error scheduling maintenance", error);
      alert(error.response?.data?.detail || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClick = (m) => {
    setSelectedMaint(m);
    setUpdateFormData({
      status: m.status,
      actual_cost: m.actual_cost || '',
      notes: m.notes || '',
      title: m.title || '',
      description: m.description || '',
      responsible: m.responsible || '',
      estimated_cost: m.estimated_cost || '',
      scheduled_date: m.scheduled_date ? new Date(m.scheduled_date).toISOString().split('T')[0] : ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...updateFormData,
        actual_cost: updateFormData.actual_cost ? parseFloat(updateFormData.actual_cost) : null,
        estimated_cost: updateFormData.estimated_cost ? parseFloat(updateFormData.estimated_cost) : null,
        scheduled_date: updateFormData.scheduled_date ? new Date(updateFormData.scheduled_date).toISOString() : null
      };
      await apiClient.put(`/maintenance/${selectedMaint.id}`, payload);
      setIsUpdateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating maintenance", error);
      alert(error.response?.data?.detail || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (m) => {
    setSelectedMaint(m);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/maintenance/${selectedMaint.id}`);
      setShowDeleteConfirm(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting maintenance", error);
      alert(error.response?.data?.detail || "Error");
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const statusLabels = {
    pendiente: t('maintenance.statusPending'),
    en_progreso: t('maintenance.statusInProgress'),
    completado: t('maintenance.statusCompleted'),
    cancelado: t('maintenance.statusCanceled')
  };

  const statusBadges = {
    pendiente: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    en_progreso: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    completado: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    cancelado: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('sidebar.maintenance')}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t('maintenance.subtitle')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
          <Plus size={18} className="mr-2" />
          {t('maintenance.newJob')}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder={t('maintenance.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
        >
          <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.allStatuses')}</option>
          <option value="pendiente" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusPending')}</option>
          <option value="en_progreso" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusInProgress')}</option>
          <option value="completado" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusCompleted')}</option>
          <option value="cancelado" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusCanceled')}</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
        >
          <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.allTypes')}</option>
          <option value="preventivo" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Preventive</option>
          <option value="correctivo" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Corrective</option>
        </select>

        <select
          value={selectedAssetFilter}
          onChange={(e) => setSelectedAssetFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
        >
          <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.allAssets')}</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{asset.name}</option>
          ))}
        </select>
      </div>

      {/* Main List */}
      {loading ? (
        <Loader />
      ) : maintenances.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--border-light)] rounded-xl bg-[var(--card-bg)] shadow-md">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-light)]">
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold">Task</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Responsible</th>
                <th className="p-4 font-semibold">Scheduled Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Est. / Actual Cost</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] text-sm text-[var(--text-primary)]">
              {maintenances.map((m) => (
                <tr key={m.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-primary)]">{m.asset_name}</span>
                      <button 
                        onClick={() => navigate(`/assets/${m.asset_id}`)}
                        className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                        title="View Asset Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 max-w-[200px] truncate">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{m.description || 'No description'}</p>
                  </td>
                  <td className="p-4 capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.type === 'preventivo' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                      {m.type === 'preventivo' ? 'Preventive' : 'Corrective'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] flex items-center justify-center text-[10px] font-bold uppercase">
                        {m.responsible.charAt(0)}
                      </div>
                      <span className="truncate">{m.responsible}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Calendar size={14} />
                      {new Date(m.scheduled_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusBadges[m.status]}`}>
                      {statusLabels[m.status]}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {m.status === 'completado' ? (
                      <span className="text-[var(--status-success)]">{formatCurrency(m.actual_cost)}</span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">{formatCurrency(m.estimated_cost)} <span className="text-[10px] text-[var(--text-muted)]">(Est.)</span></span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdateClick(m)}
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
                        title="Manage Status & Costs"
                      >
                        <Edit3 size={15} />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteClick(m)}
                          className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.05)] text-[var(--status-danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all"
                          title="Delete Task"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[350px]">
          <Wrench size={48} className="text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">{t('maintenance.noAssetsFound') || 'No Maintenances Found'}</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Start scheduling preventive tasks or documenting corrective logs.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Schedule First Task</Button>
        </div>
      )}

      {/* Create Maintenance Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title={t('maintenance.modalCreateTitle')}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('maintenance.assetToIntervene')}</label>
            <select
              name="asset_id"
              value={formData.asset_id}
              onChange={handleInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              required
            >
              <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.selectAssetPlaceholder')}</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{asset.name} ({asset.type})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('maintenance.maintenanceType')}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              required
            >
              <option value="preventivo" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.preventiveOption')}</option>
              <option value="correctivo" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.correctiveOption')}</option>
            </select>
          </div>

          <Input
            label={t('maintenance.taskTitleLabel')}
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder={t('maintenance.taskTitlePlaceholder')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('maintenance.scheduledDateLabel')}
              name="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={handleInputChange}
              required
            />
            <Input
              label={t('maintenance.estimatedCostLabel')}
              name="estimated_cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.estimated_cost}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label={t('maintenance.responsibleLabel')}
            name="responsible"
            value={formData.responsible}
            onChange={handleInputChange}
            required
            placeholder={t('maintenance.responsiblePlaceholder')}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('maintenance.descriptionLabel')}</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"
              placeholder={t('maintenance.descriptionPlaceholder')}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>{t('assets.cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting}>{t('maintenance.newJob')}</Button>
          </div>
        </form>
      </Modal>

      {/* Update/Manage Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => !isSubmitting && setIsUpdateModalOpen(false)}
        title={t('maintenance.modalUpdateTitle')}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] rounded-lg text-xs space-y-1 mb-2">
            <p className="text-[var(--text-secondary)]">Asset: <span className="text-[var(--text-primary)] font-semibold">{selectedMaint?.asset_name}</span></p>
            <p className="text-[var(--text-secondary)]">Task: <span className="text-[var(--text-primary)] font-semibold">{selectedMaint?.title}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('maintenance.taskTitleLabel')}
              name="title"
              value={updateFormData.title}
              onChange={handleUpdateInputChange}
              required
            />
            <Input
              label={t('maintenance.responsibleLabel')}
              name="responsible"
              value={updateFormData.responsible}
              onChange={handleUpdateInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('maintenance.scheduledDateLabel')}
              name="scheduled_date"
              type="date"
              value={updateFormData.scheduled_date}
              onChange={handleUpdateInputChange}
              required
            />
            <Input
              label={t('maintenance.estimatedCostLabel')}
              name="estimated_cost"
              type="number"
              step="0.01"
              min="0"
              value={updateFormData.estimated_cost}
              onChange={handleUpdateInputChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('assets.description')}</label>
            <textarea
              name="description"
              rows="2"
              value={updateFormData.description}
              onChange={handleUpdateInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"
            ></textarea>
          </div>

          <hr className="border-[var(--border-light)] my-2" />

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('maintenance.executionStatus')}</label>
            <select
              name="status"
              value={updateFormData.status}
              onChange={handleUpdateInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              required
            >
              <option value="pendiente" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusPending')}</option>
              <option value="en_progreso" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusInProgress')}</option>
              <option value="completado" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusCompleted')}</option>
              <option value="cancelado" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.statusCanceled')}</option>
            </select>
          </div>

          {updateFormData.status === 'completado' && (
            <Input
              label={t('maintenance.actualCostLabel')}
              name="actual_cost"
              type="number"
              step="0.01"
              min="0"
              value={updateFormData.actual_cost}
              onChange={handleUpdateInputChange}
              required
              placeholder={t('maintenance.actualCostPlaceholder')}
            />
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('maintenance.notesLabel')}</label>
            <textarea
              name="notes"
              rows="3"
              value={updateFormData.notes}
              onChange={handleUpdateInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"
              placeholder={t('maintenance.notesPlaceholder')}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="ghost" onClick={() => setIsUpdateModalOpen(false)}>{t('assets.cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting}>{t('settings.saveChanges')}</Button>
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
              <h3 className="text-lg font-bold text-white mb-2">{t('maintenance.deleteConfirmTitle')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('maintenance.deleteConfirmDesc')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                >
                  {t('assets.cancel')}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[var(--status-danger)] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  {t('settings.saveChanges') ? 'Confirm' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
