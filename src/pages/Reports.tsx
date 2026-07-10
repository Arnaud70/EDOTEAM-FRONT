import React, { useEffect, useState } from 'react';
import Sidebar, { MobileMenuButton } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Download, Filter, TrendingUp, Calendar, ArrowUpRight, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const COLORS = ['#064e3b', '#d4af37', '#10b981', '#3b82f6'];

const formatCurrency = (value: number | string | undefined) => {
  const amount = Number(value ?? 0);
  return amount.toLocaleString('fr-FR');
};

const groupByMonth = (items: any[], dateKey: string, valueKey: string) => {
  const buckets: Record<string, number> = {};

  items.forEach((item) => {
    const date = new Date(item[dateKey]);
    if (Number.isNaN(date.getTime())) return;

    const month = date.toLocaleString('fr-FR', { month: 'short' });
    buckets[month] = (buckets[month] ?? 0) + Number(item[valueKey] ?? 0);
  });

  return Object.entries(buckets).map(([month, value]) => ({ name: month, value }));
};

const unwrapResponse = (response: any) => response?.data?.data ?? response?.data ?? response;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="font-black text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {Number(entry.value ?? 0).toLocaleString('fr-FR')} F
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7j');

  if (!user) return null;

  const role = user.role?.toUpperCase() || 'CLIENT';
  const filteredChartData = chartData.slice(- (timeRange === '30j' ? 30 : 7));

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        if (role === 'ADMIN') {
          const response = await api.get('/admin/stats');
          const data = unwrapResponse(response);
          setStats(data);
          setChartData(
            Array.isArray(data.monthlyRevenue)
              ? data.monthlyRevenue.map((item: any) => ({ name: item.month, revenue: Number(item.revenue ?? 0) }))
              : [],
          );
          setServiceDistribution(Array.isArray(data.serviceDistribution) ? data.serviceDistribution : []);
        } else if (role === 'PRESTATAIRE') {
          const response = await api.get('/stats/provider');
          const data = unwrapResponse(response);
          setStats(data);
          setChartData(
            Array.isArray(data.monthlyRevenue)
              ? data.monthlyRevenue.map((item: any) => ({ name: item.month, revenue: Number(item.revenue ?? 0) }))
              : [],
          );
          setServiceDistribution(data.totalServices
            ? [{ name: 'Services', value: data.totalServices }]
            : []);
        } else {
          const [bookingsRes, walletRes] = await Promise.all([api.get('/bookings'), api.get('/wallet')]);
          const bookings = unwrapResponse(bookingsRes) || [];
          const wallet = unwrapResponse(walletRes) || { balance: 0, transactions: [] };

          const distributionMap = bookings.reduce((acc: Record<string, number>, booking: any) => {
            const name = booking?.service?.nom ?? 'Autres';
            acc[name] = (acc[name] ?? 0) + 1;
            return acc;
          }, {});

          setServiceDistribution(Object.entries(distributionMap).map(([name, value]) => ({ name, value })));
          setChartData(groupByMonth(bookings, 'date', 'totalAmount'));
          setStats({
            totalBookings: Array.isArray(bookings) ? bookings.length : 0,
            balance: Number(wallet?.balance ?? 0),
            transactionCount: Array.isArray(wallet?.transactions) ? wallet.transactions.length : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching report stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [role]);

  const mainValue = role === 'ADMIN'
    ? formatCurrency(stats?.chiffreAffaires)
    : role === 'PRESTATAIRE'
      ? formatCurrency(stats?.totalRevenue)
      : formatCurrency(stats?.balance);

  const mainLabel = role === 'ADMIN'
    ? 'Chiffre d\'Affaires'
    : role === 'PRESTATAIRE'
      ? 'Gains Totaux'
      : 'Balance';

  const secondaryValue = role === 'CLIENT'
    ? stats?.totalBookings ?? 0
    : role === 'PRESTATAIRE'
      ? stats?.totalBookings ?? 0
      : stats?.missionsRealisees ?? 0;

  const secondaryLabel = role === 'CLIENT'
    ? 'Réservations'
    : 'Missions Réalisées';

  const tertiaryValue = role === 'ADMIN'
    ? stats?.services ?? 0
    : role === 'PRESTATAIRE'
      ? stats?.totalServices ?? 0
      : stats?.transactionCount ?? 0;

  const tertiaryLabel = role === 'ADMIN'
    ? 'Services'
    : role === 'PRESTATAIRE'
      ? 'Services'
      : 'Transactions';

  const chartTitle = role === 'ADMIN'
    ? 'Revenus mensuels'
    : role === 'PRESTATAIRE'
      ? 'Évolution des gains'
      : 'Historique des dépenses';

  const chartDataKey = role === 'CLIENT' ? 'value' : 'revenue';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <PageHeader
          title={<>Rapports & <span className="gold-accent">Analytiques</span></>}
          subtitle={role === 'ADMIN' ? 'Performances globales de la plateforme' : (role === 'PRESTATAIRE' ? 'Suivi de vos revenus et activités' : 'Historique de vos dépenses et statistiques')}
          fixed
          actions={(
            <>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex items-center">
                <button
                  onClick={() => setTimeRange('7j')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === '7j' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  7 Jours
                </button>
                <button
                  onClick={() => setTimeRange('30j')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === '30j' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  30 Jours
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <Download size={16} />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            </>
          )}
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-[2rem] bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-elite-emerald/5 rounded-xl flex items-center justify-center text-elite-emerald">
                <TrendingUp size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">
                <ArrowUpRight size={14} /> +12%
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{mainLabel}</p>
            <h3 className="text-3xl font-black text-slate-900">
              {mainValue} <span className="text-lg">F</span>
            </h3>
          </div>

          <div className="glass-card p-6 rounded-[2rem] bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-elite-gold/10 rounded-xl flex items-center justify-center text-elite-gold">
                <Calendar size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">
                <ArrowUpRight size={14} /> +5%
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{secondaryLabel}</p>
            <h3 className="text-3xl font-black text-slate-900">{secondaryValue}</h3>
          </div>

          <div className="glass-card p-6 rounded-[2rem] bg-elite-emerald text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-elite-gold">
                <Filter size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{tertiaryLabel}</p>
            <h3 className="text-3xl font-black text-white">{tertiaryValue}</h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] bg-white">
            <h3 className="text-lg font-black text-slate-900 mb-8">{chartTitle}</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {role === 'ADMIN' ? (
                  <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#064e3b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                ) : role === 'PRESTATAIRE' ? (
                  <BarChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" name="Gains (F)" fill="#064e3b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="Dépenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDep)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-white flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-8">Répartition des Services</h3>
            <div className="flex-1 flex flex-col justify-center items-center">
              {serviceDistribution.length > 0 ? (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                          {serviceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-3">
                    {serviceDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <p className="text-sm font-semibold">Pas encore assez de données pour afficher la répartition des services.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
