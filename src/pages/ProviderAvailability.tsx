import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ProviderAvailability = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const days = [
    { id: 0, label: 'Lundi', value: 'MONDAY' },
    { id: 1, label: 'Mardi', value: 'TUESDAY' },
    { id: 2, label: 'Mercredi', value: 'WEDNESDAY' },
    { id: 3, label: 'Jeudi', value: 'THURSDAY' },
    { id: 4, label: 'Vendredi', value: 'FRIDAY' },
    { id: 5, label: 'Samedi', value: 'SATURDAY' },
    { id: 6, label: 'Dimanche', value: 'SUNDAY' },
  ];

  const [availability, setAvailability] = useState<any[]>([]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/availability/me');
      
      const dayMap: Record<string, number> = {
        MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2, THURSDAY: 3, FRIDAY: 4, SATURDAY: 5, SUNDAY: 6
      };

      const data = response.data.data || response.data;
      const mapped = data.map((item: any) => ({
        id: item.id,
        day: dayMap[item.dayOfWeek],
        start: new Date(item.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        end: new Date(item.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }));

      setAvailability(mapped);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const slots = availability.map(a => ({
        dayOfWeek: a.day,
        startTime: a.start,
        endTime: a.end,
        isRecurring: true
      }));

      await api.post('/availability', slots);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSlot = (id: string) => {
    setAvailability(prev => prev.filter(item => item.id !== id));
  };

  const addSlot = () => {
    const newId = 'temp-' + Math.random().toString(36).substr(2, 9);
    setAvailability(prev => [...prev, { id: newId, day: 0, start: '08:00', end: '17:00' }]);
  };

  const updateSlot = (id: string, field: string, value: any) => {
    setAvailability(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
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
              Gestion des <span className="gold-accent">Disponibilités</span>
            </h1>
            <p className="text-slate-500 font-medium">Définissez vos créneaux horaires pour recevoir des réservations</p>
          </motion.div>
          
          <button 
            onClick={addSlot}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald hover:shadow-xl transition-all shadow-lg active:scale-95 group"
          >
            <Plus size={18} className="text-elite-gold group-hover:rotate-90 transition-transform" />
            Ajouter un créneau
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="py-20 text-center glass-card rounded-3xl">
                   <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={40} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Récupération de votre emploi du temps...</p>
                </div>
              ) : availability.length === 0 ? (
                <div className="py-20 text-center glass-card rounded-3xl">
                   <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucun créneau défini</p>
                </div>
              ) : availability.map((item) => (
                <motion.div 
                   key={item.id}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass-card p-8 rounded-3xl bg-white border-none shadow-premium flex flex-wrap items-center gap-6"
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Jour de la semaine</label>
                    <select 
                      value={item.day}
                      onChange={(e) => updateSlot(item.id, 'day', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                    >
                      {days.map(day => (
                        <option key={day.id} value={day.id}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Heure de début</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="time" 
                        value={item.start} 
                        onChange={(e) => updateSlot(item.id, 'start', e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" 
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Heure de fin</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="time" 
                        value={item.end} 
                        onChange={(e) => updateSlot(item.id, 'end', e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => removeSlot(item.id)}
                    className="p-4 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all self-end"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6">
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <CheckCircle2 size={18} /> Planning mis à jour !
                </motion.div>
              )}
              <div className="flex-1 text-right">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-3 px-12 py-5 bg-elite-emerald text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl transition-all active:scale-95 group disabled:opacity-50"
                  >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="text-elite-gold group-hover:rotate-12 transition-transform" />}
                  Enregistrer les horaires
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 rounded-[3rem] bg-slate-900 text-white shadow-premium relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-elite-gold/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <AlertCircle size={32} className="text-elite-gold" />
                  <h3 className="text-xl font-black">Conseils Elite</h3>
                </div>
                <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                  Les prestataires disponibles le week-end reçoivent en moyenne <span className="text-elite-gold font-bold">45% plus de demandes</span> sur TogoConnect.
                </p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Impact Visibilité</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-elite-gold rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium"
            >
              <h3 className="text-xl font-black text-slate-900 mb-8">Statut Hebdomadaire</h3>
              <div className="space-y-4">
                {days.map(day => (
                  <div key={day.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.label}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Ouvert</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderAvailability;
