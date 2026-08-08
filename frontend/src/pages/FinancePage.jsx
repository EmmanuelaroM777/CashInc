import React, { useState, useEffect, useContext } from 'react';
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingDown, 
  RefreshCw, 
  Calculator, 
  Coins, 
  MousePointerClick, 
  BarChart, 
  ArrowLeft, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
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
  
  // Advanced filters, search, and pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 10, total: 0 });

  // Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Viability Analysis State
  const [selectedAsset, setSelectedAsset] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viabilityResult, setViabilityResult] = useState(null);

  // Simulated monetization stats
  const [monetization, setMonetization] = useState({
    impressions: 48200,
    clicks: 654,
    cpm: 2.50,
    ctr: 1.36,
    earnings: 120.50
  });

  const handleSimulateClicks = () => {
    setMonetization(prev => {
      const addedClicks = Math.floor(Math.random() * 15) + 3;
      const addedImpressions = addedClicks * Math.floor(Math.random() * 80 + 40);
      const newClicks = prev.clicks + addedClicks;
      const newImpressions = prev.impressions + addedImpressions;
      const newCtr = parseFloat(((newClicks / newImpressions) * 100).toFixed(2));
      const newEarnings = parseFloat(((newImpressions / 1000) * prev.cpm + newClicks * 0.15).toFixed(2));
      
      return {
        ...prev,
        impressions: newImpressions,
        clicks: newClicks,
        ctr: newCtr,
        earnings: newEarnings
      };
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (typeFilter) queryParams.append('type', typeFilter);
      queryParams.append('skip', pagination.skip.toString());
      queryParams.append('limit', pagination.limit.toString());

      const [txRes, assetsRes] = await Promise.all([
        apiClient.get(`/finances/transactions?${queryParams.toString()}`),
        apiClient.get('/assets')
      ]);

      setTransactions(txRes.data);
      setAssets(assetsRes.data.assets);
      
      setPagination(prev => ({ 
        ...prev, 
        total: txRes.data.length < prev.limit ? prev.skip + txRes.data.length : prev.skip + prev.limit + 1 
      }));
    } catch (error) {
      console.error("Error fetching finance data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViabilityCheck = async () => {
    if (!selectedAsset) return;
    setIsAnalyzing(true);
    setViabilityResult(null);
    try {
      const response = await apiClient.get(`/finances/viability/${selectedAsset}`);
      setViabilityResult(response.data);
    } catch (error) {
      console.error("Error evaluating viability", error);
      alert("Error calculating viability.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    setPagination(prev => ({ ...prev, skip: 0 }));
  }, [search, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [search, typeFilter, pagination.skip]);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && pagination.skip > 0) {
      setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
    } else if (direction === 'next') {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;

  const getTranslatedType = (type) => {
    if (type === 'ingreso') return t('finances.typeIncome');
    if (type === 'mantenimiento') return t('sidebar.maintenance');
    if (type === 'operativo') return t('finances.typeOperating');
    if (type === 'mejora') return t('finances.typeImprovement');
    return type;
  };

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
        
        {/* LEFT COLUMN: Transactions List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel overflow-hidden flex flex-col min-h-[500px]">
            
            {/* List Header and Filter controls */}
            <div className="p-5 border-b border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] space-y-4">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">{t('finances.transactionHistory')}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                  <input
                    type="text"
                    placeholder={t('finances.filterPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors w-full"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent-primary)] transition-all w-full"
                >
                  <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('maintenance.allTypes')}</option>
                  <option value="ingreso" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('finances.typeIncome')}</option>
                  <option value="mantenimiento" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('sidebar.maintenance')}</option>
                  <option value="operativo" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('finances.typeOperating')}</option>
                  <option value="mejora" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('finances.typeImprovement')}</option>
                </select>
              </div>
            </div>
            
            {/* Transactions Rows */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <Loader />
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3.5 rounded-xl border border-[var(--border-light)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          tx.type === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type === 'ingreso' ? '+' : '-'}
                        </div>
                        <div className="space-y-0.5 max-w-[250px] sm:max-w-[400px]">
                          <p className="font-semibold text-white truncate">{tx.description}</p>
                          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
                            <span>{tx.asset_name}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                            <span className="capitalize">{getTranslatedType(tx.type)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className={`font-mono font-bold text-sm ${
                          tx.type === 'ingreso' ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'
                        }`}>
                          {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)]">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                  <TrendingDown size={36} className="mb-2 opacity-50" />
                  <p>{t('finances.noTransactions')}</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && transactions.length > 0 && (
              <div className="p-4 border-t border-[var(--border-light)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Pág. {currentPage}</span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.skip === 0}
                    onClick={() => handlePageChange('prev')}
                    className="p-1 px-3 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] text-white hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> {t('finances.prev')}
                  </button>
                  <button
                    disabled={transactions.length < pagination.limit}
                    onClick={() => handlePageChange('next')}
                    className="p-1 px-3 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] text-white hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                  >
                    {t('finances.next')} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Viability Analysis & Simulated Monetization */}
        <div className="space-y-6">
          
          {/* Viability Analysis Widget */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3 flex items-center">
              <Calculator className="mr-2 text-[var(--accent-primary)]" size={18} />
              {t('finances.viabilityAnalysis')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              {t('finances.viabilityDesc')}
            </p>
            <div className="space-y-4">
              <select
                value={selectedAsset}
                onChange={(e) => {
                  setSelectedAsset(e.target.value);
                  setViabilityResult(null);
                }}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              >
                <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t('finances.selectAsset')}</option>
                {assets.map(a => <option key={a.id} value={a.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{a.name}</option>)}
              </select>
              <Button 
                fullWidth 
                variant="secondary" 
                className="flex items-center justify-center text-sm"
                onClick={handleViabilityCheck}
                isLoading={isAnalyzing}
                disabled={!selectedAsset}
              >
                {t('finances.analyze')}
              </Button>

              {/* Viability Results Output */}
              {viabilityResult && (
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] text-xs space-y-2.5 animate-fade-in">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">{t('finances.evaluation')}</h4>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">{t('finances.npvLabel')}</span>
                    <span className={`font-bold ${viabilityResult.net_present_value >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
                      {formatCurrency(viabilityResult.net_present_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">{t('finances.paybackLabel')}</span>
                    <span className="font-semibold text-white">{viabilityResult.payback_period_months.toFixed(1)} {t('finances.months')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">{t('finances.monthlyCashFlowLabel')}</span>
                    <span className="font-semibold text-white">{formatCurrency(viabilityResult.monthly_cash_flow)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border-light)] pt-2 items-center">
                    <span className="text-[var(--text-secondary)]">{t('finances.rulingLabel')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${viabilityResult.is_viable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      {viabilityResult.is_viable ? t('finances.viable') : t('finances.notViable')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed pt-1">{viabilityResult.recommendation}</p>
                </div>
              )}
            </div>
          </div>

          {/* SIMULATED MONETIZATION WIDGET */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3 flex items-center">
              <Coins className="mr-2 text-amber-400" size={18} />
              {t('finances.monetizationTitle')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              {t('finances.monetizationDesc')}
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] rounded-xl">
                  <p className="text-[var(--text-muted)] text-[10px] mb-0.5">{t('finances.impressions')}</p>
                  <p className="font-bold text-white text-sm">{monetization.impressions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] rounded-xl">
                  <p className="text-[var(--text-muted)] text-[10px] mb-0.5">{t('finances.totalClicks')}</p>
                  <p className="font-bold text-white text-sm">{monetization.clicks.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] rounded-xl">
                  <p className="text-[var(--text-muted)] text-[10px] mb-0.5">{t('finances.avgCtr')}</p>
                  <p className="font-bold text-cyan-400 text-sm">{monetization.ctr}%</p>
                </div>
                <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-light)] rounded-xl">
                  <p className="text-[var(--text-muted)] text-[10px] mb-0.5">{t('finances.fixedCpm')}</p>
                  <p className="font-bold text-emerald-400 text-sm">${monetization.cpm.toFixed(2)}</p>
                </div>
              </div>

              {/* Earnings Panel */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col justify-center items-center shadow-inner">
                <p className="text-[var(--text-secondary)] text-xs mb-1">{t('finances.estAdEarnings')}</p>
                <p className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                  {formatCurrency(monetization.earnings)}
                </p>
                <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mt-1">{t('finances.activeSimulation')}</span>
              </div>

              <button
                onClick={handleSimulateClicks}
                className="w-full flex items-center justify-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] text-white hover:bg-[rgba(255,255,255,0.1)] hover:border-amber-500/30 transition-all font-semibold"
              >
                <MousePointerClick size={14} className="text-amber-400" />
                {t('finances.simulateBtn')}
              </button>
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
