import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/wallet');
      setWallet(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (!user) return null;

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
              Mon <span className="gold-accent">Portefeuille</span>
            </h1>
            <p className="text-slate-500 font-medium">Gérez vos fonds et suivez vos transactions financières</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald hover:shadow-xl transition-all shadow-lg active:scale-95 group">
              <Plus size={18} className="text-elite-gold group-hover:rotate-90 transition-transform" />
              Alimenter
            </button>
            {user.role === 'PRESTATAIRE' && (
              <button className="px-6 py-4 border-2 border-slate-100 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-elite-gold/30 transition-all shadow-sm">
                Demander un retrait
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {isLoading ? (
            <div className="col-span-full py-20 text-center glass-card rounded-[3rem]">
              <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accès à votre coffre-fort...</p>
            </div>
          ) : (
            <>
              {/* Balance Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="xl:col-span-1 p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl group min-h-[300px] flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-elite-gold/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <div className="p-3 bg-white/10 rounded-2xl text-elite-gold">
                      <WalletIcon size={24} />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-8 h-5 bg-white/20 rounded-md" />
                        <div className="w-8 h-5 bg-white/10 rounded-md" />
                    </div>
                  </div>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Balance Disponibles</p>
                  <h2 className="text-4xl font-black font-heading mb-1 tracking-tight">{Number(wallet?.balance || 0).toLocaleString()} <span className="text-xl font-bold text-elite-gold uppercase">f</span></h2>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest mt-12">
                   <span>ID: {wallet?.id?.slice(0, 8).toUpperCase() || 'ELITE-001'}</span>
                   <span className="ml-auto">Elite Plus</span>
                </div>
              </motion.div>

              {/* Transaction List */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="xl:col-span-2 glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium"
              >
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900">Historique des Flux</h3>
                  <button className="text-elite-emerald font-bold text-sm hover:underline">Voir tout</button>
                </div>

                <div className="space-y-6">
                  {!wallet?.transactions?.length ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                      Aucune transaction récente
                    </div>
                  ) : wallet.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50 rounded-3xl transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'bg-green-500/10 text-green-500' : 
                          tx.type === 'WITHDRAWAL' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm mb-0.5">{tx.description || tx.type}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(tx.createdAt).toLocaleDateString('fr-FR')} • {tx.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm mb-1 ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-slate-900'}`}>
                          {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}{Number(tx.amount).toLocaleString()} F
                        </p>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          tx.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tx.status === 'COMPLETED' ? 'COMPLÉTÉ' : 'EN ATTENTE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Wallet;
