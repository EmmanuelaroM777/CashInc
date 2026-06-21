import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, DollarSign, TrendingDown, RefreshCw, Calculator } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loader from '../components/UI/Loader';
import TransactionModal from '../components/UI/TransactionModal';

const FinancePage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, assetsRes] = await Promise.all([
        apiClient.get('/finances/transactions'),
        apiClient.get('/assets')
      ]);
      setTransactions(txRes.data);
      setAssets(assetsRes.data.assets);
    } catch (error) {
      console.error("Error fetching finance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('finances.title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('finances.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Plus size={18} className="mr-2" />
              {t('finances.newTransaction')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 glass-panel overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[var(--border-light)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">{t('finances.transactionHistory')}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <Loader />
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 rounded-lg bg-[var(--input-bg)] border border-[var(--border-light)] flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'ingreso' ? 'bg-[var(--status-success)] text-white' : 'bg-[var(--status-danger)] text-white'} bg-opacity-20`}>
                        {tx.type === 'ingreso' ? <DollarSign size={20} className="text-[var(--status-success)]"/> : <TrendingDown size={20} className="text-[var(--status-danger)]"/>}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{tx.description || tx.type}</p>
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
                <p>{t('finances.noTransactions')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Budgets / Viability Quick Access */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('finances.viabilityAnalysis')}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {t('finances.viabilityDesc')}
            </p>
            <div className="space-y-3">
              <select className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="">{t('finances.selectAsset')}</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <Button fullWidth variant="secondary" className="flex items-center justify-center">
                <Calculator size={18} className="mr-2" /> {t('finances.analyze')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default FinancePage;
