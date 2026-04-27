import React, { useState, useEffect, useContext } from 'react';
import { 
  Building2, 
  CircleDollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bed,
  Activity,
  Users,
  Bell,
  Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import apiClient from '../api/client';
import Loader from '../components/UI/Loader';
import Button from '../components/UI/Button';
import TransactionModal from '../components/UI/TransactionModal';
import WireframeCubes from '../components/UI/WireframeCubes';
import { AuthContext } from '../context/AuthContext';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, highlight }) => (
  <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[rgba(255,255,255,0.2)] transition-colors" style={{ backgroundColor: '#1a1c23', borderColor: 'rgba(255,255,255,0.05)' }}>
    <div className="flex justify-between items-start mb-6 z-10">
      <h3 className="text-[var(--text-secondary)] text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={20} />
      </div>
    </div>
    <div className="z-10">
      <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
      {highlight && <p className={`text-xs mt-1 ${highlight.startsWith('+') ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}`}>{highlight}</p>}
    </div>
    {/* Subtle gradient background effect */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl" style={{ backgroundColor: colorClass.includes('blue') ? '#3b82f6' : colorClass.includes('purple') ? '#8b5cf6' : colorClass.includes('green') ? '#10b981' : colorClass.includes('yellow') ? '#f59e0b' : '#06b6d4' }}></div>
  </div>
);

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get('/finances/summary');
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <Loader />;
  if (!summary) return <div className="text-center p-8">Error cargando datos del dashboard.</div>;

  // Custom Neon Colors for Donut Chart
  const COLORS = ['#06b6d4', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0a0e1a, #111827)' }}>
      
      {/* Header Section (Welcome Back) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-[var(--text-secondary)]">Here's what's happening with your assets today</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center">
              <Plus size={18} className="mr-2" />
              Registrar Gasto
            </Button>
          )}
          <div className="px-4 py-2 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[var(--accent-tertiary)] font-medium text-sm capitalize flex items-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            {user?.role}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Activos" 
          value={summary.total_assets} 
          subtitle="Registros activos"
          icon={Users} 
          colorClass="bg-cyan-500"
        />
        <StatCard 
          title="Inversión Total" 
          value={formatCurrency(summary.total_investment)} 
          subtitle="Inversión inicial global"
          icon={Calendar} 
          colorClass="bg-purple-500"
        />
        <StatCard 
          title="Gastos Totales" 
          value={formatCurrency(summary.total_expenses)} 
          subtitle={`${summary.top_assets_by_cost?.length || 0} activos con gastos`}
          icon={Bed} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="ROI Promedio" 
          value={`${summary.average_roi}%`} 
          subtitle="Rendimiento Global"
          highlight={summary.average_roi > 0 ? "Objetivo alcanzado" : "Bajo rendimiento"}
          icon={CircleDollarSign} 
          colorClass="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6" style={{ backgroundColor: '#1a1c23', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-white">Flujo Financiero</h3>
              <p className="text-xs text-[var(--text-muted)]">Gastos mensuales vs Ingresos</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[var(--accent-tertiary)] mr-2 shadow-[0_0_8px_var(--accent-tertiary)]"></span> Gastos</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] mr-2 shadow-[0_0_8px_var(--accent-secondary)]"></span> Ingresos</div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthly_expenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-tertiary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-tertiary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Area type="monotone" dataKey="expenses" name="Gastos" stroke="var(--accent-tertiary)" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" activeDot={{ r: 6, fill: "var(--accent-tertiary)", stroke: "white", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="income" name="Ingresos" stroke="var(--accent-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" activeDot={{ r: 6, fill: "var(--accent-secondary)", stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel p-6" style={{ backgroundColor: '#1a1c23', borderColor: 'rgba(255,255,255,0.05)' }}>
          <h3 className="text-lg font-medium text-white mb-2">Distribución de Gastos</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Gastos clasificados por categoría</p>
          
          <div className="h-[220px] w-full flex flex-col items-center justify-center relative">
            {summary.expenses_by_category && summary.expenses_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.expenses_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="category"
                    stroke="none"
                  >
                    {summary.expenses_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[var(--text-muted)] text-sm">No hay datos de gastos</p>
            )}
            
            {/* Center Text inside Donut */}
            {summary.expenses_by_category && summary.expenses_by_category.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[var(--text-muted)] text-xs">Total</span>
                <span className="text-white font-bold text-lg">{formatCurrency(summary.total_expenses)}</span>
              </div>
            )}
          </div>
          
          {/* Custom Legend */}
          <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
            {summary.expenses_by_category?.map((entry, index) => {
              const percentage = Math.round((entry.total / summary.total_expenses) * 100) || 0;
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-[var(--text-secondary)]">
                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 5px ${COLORS[index % COLORS.length]}` }}></span>
                    <span className="capitalize truncate max-w-[70px]">{entry.category}</span>
                  </div>
                  <span className="text-white font-medium ml-1">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Wireframe Animation */}
      <WireframeCubes />

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={fetchSummary} 
      />
    </div>
  );
};

export default DashboardPage;
