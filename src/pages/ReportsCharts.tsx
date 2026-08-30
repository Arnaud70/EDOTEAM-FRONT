import React from 'react';
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
} from 'recharts';

const COLORS = ['#064e3b', '#d4af37', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
        <p className="font-black text-slate-900 dark:text-white mb-2">{label}</p>
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

const ReportsCharts = ({ role, filteredChartData, chartTitle, serviceDistribution }: any) => {
  return (
    <>
      <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">{chartTitle}</h3>
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

      <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 flex flex-col">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">Répartition des Services</h3>
        <div className="flex-1 flex flex-col justify-center items-center">
          {serviceDistribution.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {serviceDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-4 space-y-3">
                {serviceDistribution.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm font-semibold">Pas encore assez de données pour afficher la répartition des services.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportsCharts;
