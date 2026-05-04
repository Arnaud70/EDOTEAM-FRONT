import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

interface UserData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
  deletedAt: string | null;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/users', {
        params: { role: roleFilter || undefined }
      });
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSuspend = async (userId: string) => {
    if (!confirm('Voulez-vous vraiment suspendre cet utilisateur ?')) return;
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/restore`);
      fetchUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

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
              Gestion des <span className="gold-accent">Utilisateurs</span>
            </h1>
            <p className="text-slate-500 font-medium">Contrôlez et gérez tous les membres de la plateforme</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 md:flex-none relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un membre..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-medium text-sm"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-elite-gold transition-colors"
            >
              <option value="">Tous les Rôles</option>
              <option value="CLIENT">Clients</option>
              <option value="PRESTATAIRE">Prestataires</option>
            </select>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-premium bg-white/70 backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rôle</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscription</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right px-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-elite-gold/20 border-t-elite-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des membres...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.filter(u => 
                  u.nom.toLowerCase().includes(search.toLowerCase()) || 
                  u.email.toLowerCase().includes(search.toLowerCase())
                ).map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[10px] font-black text-slate-300 text-center">#{item.id.slice(0, 8)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-elite-gold text-xs shadow-lg">
                          {item.nom?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.nom} {item.prenom}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={12} /> {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.role === 'PRESTATAIRE' ? 'bg-elite-gold/10 text-elite-gold' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.deletedAt ? (
                          <>
                            <XCircle size={16} className="text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">SUSPENDU</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">ACTIF</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-bold">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-8 py-6 text-right px-12">
                      <div className="flex items-center justify-end gap-2">
                        {item.deletedAt ? (
                          <button 
                            onClick={() => handleRestore(item.id)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                            title="Restaurer"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSuspend(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Suspendre"
                          >
                            <ShieldAlert size={18} />
                          </button>
                        )}
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Affichage de {users.length} membres
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Précédent</button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-elite-emerald transition-all shadow-lg active:scale-95">Suivant</button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminUsers;
