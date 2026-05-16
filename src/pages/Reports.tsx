import React, { useState } from 'react';
import Sidebar, { MobileMenuButton } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, Filter, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

// Mock Data
const adminRevenueData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Fév', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Avr', revenue: 2780, profit: 3908 },
  { name: 'Mai', revenue: 1890, profit: 4800 },
  { name: 'Juin', revenue: 2390, profit: 3800 },
  { name: 'Juil', revenue: 3490, profit: 4300 },
];

const providerRevenueData = [
  { name: 'Lun', gains: 12000 },
  { name: 'Mar', gains: 19000 },
  { name: 'Mer', gains: 15000 },
  { name: 'Jeu', gains: 22000 },
  { name: 'Ven', gains: 28000 },
  { name: 'Sam', gains: 35000 },
  { name: 'Dim', gains: 10000 },
];

const clientSpendingData = [
  { name: 'Jan', depenses: 15000 },
  { name: 'Fév', depenses: 23000 },
  { name: 'Mar', depenses: 5000 },
  { name: 'Avr', depenses: 42000 },
  { name: 'Mai', depenses: 12000 },
];

const serviceDistribution = [
  { name: 'Plomberie', value: 400 },
  { name: 'Électricité', value: 300 },
  { name: 'Ménage', value: 300 },
  { name: 'Informatique', value: 200 },
];

const COLORS = ['#064e3b', '#d4af37', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="font-black text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()} F
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7j');

  if (!user) return null;

  const role = user.role?.toUpperCase() || 'CLIENT';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <MobileMenuButton />
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
                Rapports & <span className="gold-accent">Analytiques</span>
              </h1>
              <p className="text-slate-500 font-medium">
                {role === 'ADMIN' ? 'Performances globales de la plateforme' : 
                 role === 'PRESTATAIRE' ? 'Suivi de vos revenus et activités' : 
                 'Historique de vos dépenses et statistiques'}
              </p>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
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
          </div>
        </header>

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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {role === 'PRESTATAIRE' ? 'Gains Totaux' : role === 'ADMIN' ? 'Chiffre d\'Affaires' : 'Dépenses Totales'}
            </p>
            <h3 className="text-3xl font-black text-slate-900">
              {role === 'PRESTATAIRE' ? '141,000' : role === 'ADMIN' ? '1,240,000' : '95,000'} <span className="text-lg">F</span>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {role === 'CLIENT' ? 'Services Réservés' : 'Missions Réalisées'}
            </p>
            <h3 className="text-3xl font-black text-slate-900">
              {role === 'ADMIN' ? '458' : role === 'PRESTATAIRE' ? '24' : '12'}
            </h3>
          </div>

          <div className="glass-card p-6 rounded-[2rem] bg-elite-emerald text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-elite-gold">
                <Filter size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
              Taux de Conversion
            </p>
            <h3 className="text-3xl font-black text-white">68%</h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] bg-white">
            <h3 className="text-lg font-black text-slate-900 mb-8">
              {role === 'PRESTATAIRE' ? 'Évolution des Gains' : role === 'ADMIN' ? 'Revenus vs Profits' : 'Historique des Dépenses'}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {role === 'ADMIN' ? (
                  <AreaChart data={adminRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#064e3b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#064e3b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="profit" name="Profits" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                  </AreaChart>
                ) : role === 'PRESTATAIRE' ? (
                  <BarChart data={providerRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="gains" name="Gains (F)" fill="#064e3b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={clientSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="depenses" name="Dépenses (F)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDep)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart / Pie */}
          <div className="glass-card p-8 rounded-[2.5rem] bg-white flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-8">Répartition des Services</h3>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
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
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Reports;
