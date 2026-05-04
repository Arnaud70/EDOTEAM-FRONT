import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Shield, Lock, Smartphone, Fingerprint, Eye, ArrowRight, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const Security = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/users/password', passwords);
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès.' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

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
              {user.role === 'ADMIN' ? 'Sécurité' : 'Sécurité & Accès'}
            </h1>
            <p className="text-slate-500 font-medium">Protégez votre compte avec les standards EDOTEAM Elite</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium transition-all hover:shadow-2xl"
          >
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 bg-elite-emerald/5 rounded-2xl flex items-center justify-center text-elite-emerald">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Mot de Passe</h3>
                <p className="text-sm text-slate-400 font-medium">Dernière modification il y a quelques mois</p>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 mb-6 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ancien mot de passe</label>
                <input 
                  type="password" 
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  placeholder="••••••••" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="••••••••" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" 
                />
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-elite-emerald transition-all shadow-lg active:scale-95 mt-4 flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : "Actualiser l'Accès"}
              </button>
            </form>
          </motion.div>

          <div className="space-y-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-elite-gold/10 rounded-2xl flex items-center justify-center text-elite-gold">
                    <Smartphone size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Double Authentification (2FA)</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Recommandé</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-8 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-elite-emerald shadow-inner transition-all" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Une couche de sécurité supplémentaire en demandant un code envoyé par SMS ou application mobile.
              </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="glass-card p-10 rounded-[3rem] bg-elite-emerald text-white shadow-premium relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <ShieldCheck size={32} className="text-elite-gold" />
                  <h3 className="text-xl font-black">Statut de Sécurité</h3>
                </div>
                <p className="text-white/70 text-sm font-medium mb-8">
                  Votre compte est protégé par nos systèmes de détection de menace en temps réel.
                </p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-white/10 px-4 py-2 rounded-full">Score: 98/100</span>
                  <span className="text-elite-gold">Excellent</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
