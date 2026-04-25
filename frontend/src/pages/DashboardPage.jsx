import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CircleDollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import apiClient from '../api/client';
import Loader from '../components/UI/Loader';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="glass-panel p-6 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSummary();
  }, []);

  if (loading) return <Loader />;
  if (!summary) return <div className="text-center p-8">Error cargando datos del dashboard.</div>;

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Resumen General</h2>
          <p className="text-[var(--text-secondary)]">Vista financiera global de su infraestructura</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Activos" 
          value={summary.total_assets} 
          icon={Building2} 
          colorClass="bg-blue-500"
        />
        <StatCard 
          title="Inversión Total" 
          value={formatCurrency(summary.total_investment)} 
          icon={CircleDollarSign} 
          colorClass="bg-purple-500"
        />
        <StatCard 
          title="Gastos Totales" 
          value={formatCurrency(summary.total_expenses)} 
          icon={TrendingUp} 
          trend="up"
          trendValue="Mensual"
          colorClass="bg-red-500"
        />
        <StatCard 
          title="ROI Promedio" 
          value={`${summary.average_roi}%`} 
          icon={AlertTriangle} 
          trend={summary.average_roi >= 0 ? "up" : "down"}
          trendValue="Global"
          colorClass="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4">Gastos vs Ingresos (Últimos 12 meses)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthly_expenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Bar dataKey="total" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4">Distribución de Gastos</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            {summary.expenses_by_category && summary.expenses_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.expenses_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {summary.expenses_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[var(--text-muted)]">No hay datos de gastos</p>
            )}
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {summary.expenses_by_category.map((entry, index) => (
                <div key={index} className="flex items-center text-xs text-[var(--text-secondary)]">
                  <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="capitalize">{entry.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Assets Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Top Activos por Costo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] text-sm">
                <th className="p-4 font-medium">Nombre del Activo</th>
                <th className="p-4 font-medium text-right">Costo Total</th>
                <th className="p-4 font-medium text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] text-sm">
              {summary.top_assets_by_cost && summary.top_assets_by_cost.length > 0 ? (
                summary.top_assets_by_cost.map((asset, index) => (
                  <tr key={index} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4 text-white font-medium">{asset.name}</td>
                    <td className="p-4 text-[var(--status-danger)] text-right">{formatCurrency(asset.total_cost)}</td>
                    <td className={`p-4 text-right font-medium ${asset.roi >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
                      {asset.roi}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-[var(--text-muted)]">
                    No hay datos suficientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
