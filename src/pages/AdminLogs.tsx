import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Clock, User, Shield, Terminal, Globe, Monitor, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

interface LogData {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

const AdminLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/logs');
      setLogs(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (!user || user.role?.toUpperCase() !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
              Logs d' <span className="gold-accent">Activité</span>
            </h1>
            <p className="text-slate-500 font-medium">Audit complet de toutes les actions système et sécurité</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 md:flex-none relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une action ou un membre..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-medium text-sm"
              />
            </div>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-premium bg-white/70 backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sécurité (IP/OS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-elite-gold/20 border-t-elite-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement de l'audit...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.filter(l => 
                  l.action.toLowerCase().includes(search.toLowerCase()) || 
                  (l.user?.nom || '').toLowerCase().includes(search.toLowerCase()) ||
                  (l.details || '').toLowerCase().includes(search.toLowerCase())
                ).map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-300" />
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(log.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{log.user.nom} {log.user.prenom}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-400 italic">Système / Inconnu</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                        log.action.includes('SUSPEND') || log.action.includes('DELETE') 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-elite-emerald/10 text-elite-emerald'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {log.details || '-'}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Globe size={12} /> {log.ipAddress || 'Inconnue'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Monitor size={12} /> {log.userAgent?.split(' ')[0] || 'Mobile/Unknown'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <Terminal className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune activité enregistrée</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLogs;
