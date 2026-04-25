import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, DollarSign, TrendingDown, RefreshCw, Calculator } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import Loader from '../components/UI/Loader';

const FinancePage = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    type: 'operativo',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, assetsRes] = await Promise.all([
        apiClient.get('/finances/transactions'),
        apiClient.get('/assets')
      ]);
      setTransactions(txRes.data);
      setAssets(assetsRes.data.assets);
      
      if (assetsRes.data.assets.length > 0 && !formData.asset_id) {
        setFormData(prev => ({ ...prev, asset_id: assetsRes.data.assets[0].id }));
      }
    } catch (error) {
      console.error("Error fetching finance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_id) {
      alert("Debe seleccionar un activo");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };
      
      await apiClient.post('/finances/transactions', payload);
      setIsModalOpen(false);
      fetchData();
      
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error("Error creating transaction", error);
      alert("Error al registrar transacción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Control Financiero</h2>
          <p className="text-[var(--text-secondary)]">Gestione transacciones y presupuestos</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Plus size={18} className="mr-2" />
              Nueva Transacción
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 glass-panel overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[var(--border-light)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-lg font-medium text-white">Historial de Transacciones</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <Loader />
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'ingreso' ? 'bg-[var(--status-success)] text-white' : 'bg-[var(--status-danger)] text-white'} bg-opacity-20`}>
                        {tx.type === 'ingreso' ? <DollarSign size={20} className="text-[var(--status-success)]"/> : <TrendingDown size={20} className="text-[var(--status-danger)]"/>}
                      </div>
                      <div>
                        <p className="font-medium text-white">{tx.description || tx.type}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                          <span className="capitalize">{tx.asset_name}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                          {tx.category && (
                            <>
                              <span>•</span>
                              <span className="bg-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded text-[10px]">{tx.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'ingreso' ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
                      {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-[var(--text-muted)]">
                <RefreshCw size={48} className="mb-4 opacity-50" />
                <p>No hay transacciones registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Budgets / Viability Quick Access */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-white mb-4">Análisis de Viabilidad</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Calcule el VAN y período de recuperación de sus activos. Seleccione un activo para analizar.
            </p>
            <div className="space-y-3">
              <select className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="">Seleccione un activo...</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <Button fullWidth variant="secondary" className="flex items-center justify-center">
                <Calculator size={18} className="mr-2" /> Analizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Registrar Transacción"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Activo Relacionado</label>
            <select name="asset_id" value={formData.asset_id} onChange={handleInputChange} required className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
              {assets.map(a => (
                <option key={a.id} value={a.id} className="bg-[var(--bg-secondary)]">{a.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo</label>
              <select name="type" value={formData.type} onChange={handleInputChange} required className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="operativo" className="bg-[var(--bg-secondary)]">Gasto Operativo</option>
                <option value="mantenimiento" className="bg-[var(--bg-secondary)]">Mantenimiento</option>
                <option value="mejora" className="bg-[var(--bg-secondary)]">Mejora/Inversión</option>
                <option value="ingreso" className="bg-[var(--bg-secondary)]">Ingreso</option>
              </select>
            </div>
            <Input label="Monto ($)" name="amount" type="number" step="0.01" min="0.01" value={formData.amount} onChange={handleInputChange} required />
          </div>

          <Input label="Fecha" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
          <Input label="Categoría (Opcional)" name="category" value={formData.category} onChange={handleInputChange} placeholder="Ej. Electricidad, Pintura..." />
          <Input label="Descripción (Opcional)" name="description" value={formData.description} onChange={handleInputChange} />

          <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-[var(--border-light)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePage;
