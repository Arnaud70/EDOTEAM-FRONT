import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, MoreVertical, CheckCircle2, Star, Clock, ToggleLeft as Toggle, Zap, Pipette, Brush, Trash2, Loader2, X, Save, AlertCircle, Settings, ShieldCheck, Scissors, Droplet, Hammer, Baby, Camera, Wrench, Book, ChefHat, Truck, Activity, PenTool, Code, Flower, Computer, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

interface ServiceData {
  id: string;
  prixIndicatif: number;
  experience: number;
  service: {
    id: string;
    nom: string;
    icon: string;
    description: string;
  };
}

const ProviderServices = () => {
  const { user } = useAuth();
  const [myServices, setMyServices] = useState<ServiceData[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newService, setNewService] = useState({
    serviceId: '',
    prixIndicatif: '',
    experience: '',
  });

  const fetchMyServices = async () => {
    try {
      setIsLoading(true);
      const [myRes, allRes] = await Promise.all([
        api.get('/services/me'),
        api.get('/services')
      ]);
      setMyServices(myRes.data.data || myRes.data);
      setAllServices(allRes.data.data || allRes.data);
    } catch (error) {
      console.error('Error fetching my services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.serviceId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('/services/me', {
        serviceId: newService.serviceId,
        prixIndicatif: parseFloat(newService.prixIndicatif) || 0,
        experience: parseInt(newService.experience) || 0,
      });
      await fetchMyServices();
      setIsModalOpen(false);
      setNewService({ serviceId: '', prixIndicatif: '', experience: '' });
    } catch (error: any) {
      console.error('Error adding service:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout du service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (serviceId: string) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce service ?')) return;
    try {
      await api.delete(`/services/me/${serviceId}`);
      fetchMyServices();
    } catch (error) {
      console.error('Error removing service:', error);
    }
  };

  if (!user || user.role !== 'PRESTATAIRE') return null;

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
              Mes <span className="gold-accent">Services</span>
            </h1>
            <p className="text-slate-500 font-medium">Gérez votre catalogue de prestations et vos tarifs</p>
          </motion.div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-elite-emerald hover:shadow-xl transition-all active:scale-95 group"
          >
            <Plus size={18} className="text-elite-gold group-hover:rotate-90 transition-transform" />
            Ajouter une prestation
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={40} />
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Synchronisation de votre catalogue...</p>
            </div>
          ) : myServices.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card rounded-[2.5rem]">
              <Zap className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Vous n'avez pas encore configuré de services</p>
            </div>
          ) : myServices.map((item, index) => {
            const IconMap: any = { Zap, Pipette, Brush, Flower, Computer, Wind, Settings, ShieldCheck, Scissors, Droplet, Hammer, Baby, Camera, Wrench, Book, ChefHat, Truck, Activity, PenTool, Code };
            const Icon = IconMap[item.service.icon || 'Zap'] || Zap;
            return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] bg-white border-none shadow-premium relative group hover:-translate-y-2 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-elite-emerald/5 text-elite-emerald group-hover:bg-elite-emerald group-hover:text-white">
                  <Icon size={24} />
                </div>
                <div className="flex gap-2">
                   <button className="p-2 text-slate-300 hover:text-white hover:bg-elite-emerald rounded-lg transition-all"><Toggle size={20} /></button>
                   <button 
                    onClick={() => handleRemove(item.service.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                    <Trash2 size={20} />
                   </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-elite-gold fill-elite-gold" />
                    <span className="text-xs font-black text-slate-900">N/A</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.experience || 0} ans d'exp.</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{item.service.nom}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">{item.service.description || 'Pas de description'}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Prix Indicatif</p>
                  <p className="text-xl font-black text-slate-900">{item.prixIndicatif || 0} F</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ACTIF</span>
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        {/* Add Service Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 z-10"
              >
                <X size={24} />
              </button>

              <div className="p-12">
                <h2 className="text-3xl font-black text-slate-900 mb-8">Ajouter une prestation</h2>
                
                <form onSubmit={handleAddService} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Service à proposer</label>
                    <select 
                      required
                      value={newService.serviceId}
                      onChange={(e) => setNewService({...newService, serviceId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm appearance-none"
                    >
                      <option value="">Sélectionner un service</option>
                      {allServices
                        .filter(s => !myServices.some(ms => ms.service.id === s.id))
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Prix (F)</label>
                      <input 
                        required
                        type="number"
                        value={newService.prixIndicatif}
                        onChange={(e) => setNewService({...newService, prixIndicatif: e.target.value})}
                        placeholder="Ex: 5000"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Années d'exp.</label>
                      <input 
                        required
                        type="number"
                        value={newService.experience}
                        onChange={(e) => setNewService({...newService, experience: e.target.value})}
                        placeholder="Ex: 5"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-elite-emerald transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="text-elite-gold" />}
                    {isSubmitting ? 'Ajout en cours...' : 'Enregistrer le service'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderServices;
