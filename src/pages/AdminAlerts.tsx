import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { AlertCircle, ShieldAlert, MessageSquare, User, CheckCircle2, MoreVertical, Flag, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

interface ReportData {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: {
    nom: string;
    prenom: string;
  };
  targetId: string;
}

const AdminAlerts = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/reports');
      setReports(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { status: 'RESOLVED' });
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  if (!user || user.role?.toUpperCase() !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
              Centre de <span className="gold-accent">Sécurité</span>
            </h1>
            <p className="text-slate-500 font-medium">Gérez les signalements et les alertes de la plateforme</p>
          </motion.div>
        </header>

        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-premium">
              <div className="w-12 h-12 border-4 border-elite-gold/20 border-t-elite-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse des rapports en cours...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-premium">
              <CheckCircle2 className="mx-auto text-green-200 mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun signalement en attente</p>
            </div>
          ) : reports.map((alert, index) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] bg-white border-none shadow-premium relative group hover:-translate-y-1 transition-all"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  alert.status === 'PENDING' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {alert.type === 'MESSAGE' ? <MessageSquare size={28} /> : 
                   alert.type === 'USER' ? <User size={28} /> : <Flag size={28} />}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      alert.status === 'PENDING' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{alert.type} • #{alert.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{alert.reason}</h3>
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span className="flex items-center gap-2 italic"><User size={12} /> Par: {alert.reporter.nom} {alert.reporter.prenom}</span>
                    <span className="flex items-center gap-2 italic"><AlertCircle size={12} /> Cible ID: {alert.targetId.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="xl:pl-8 xl:border-l border-slate-50 flex items-center justify-between xl:justify-end gap-10">
                   <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-black text-slate-900">
                      {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                   </div>
                   <div className="flex items-center gap-3">
                    {alert.status === 'PENDING' && (
                      <button 
                        onClick={() => handleResolve(alert.id)}
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-elite-emerald transition-all shadow-lg active:scale-95"
                      >
                        Marquer comme résolu
                      </button>
                    )}
                    <button className="p-4 bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition-all"><MoreVertical size={20} /></button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminAlerts;
