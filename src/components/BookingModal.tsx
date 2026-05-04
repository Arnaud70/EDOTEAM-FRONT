import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    nom: string;
    prenom: string;
    services: {
      id: string;
      prixIndicatif: string;
      service: {
        id: string;
        nom: string;
      };
    }[];
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, provider }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    startTime: '',
    duration: '1', // in hours
    address: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const selectedService = provider.services.find(s => s.service.id === formData.serviceId);
      const basePrice = parseFloat(selectedService?.prixIndicatif || '0');
      
      // Calculate times
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60 * 60 * 1000);

      await api.post('/bookings', {
        prestataireId: provider.id,
        serviceId: formData.serviceId,
        date: startDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalAmount: basePrice, // Simple logic for now
        address: formData.address,
      });

      setStep(3);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réservation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 z-10">
            <X size={24} />
          </button>

          <div className="p-12">
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Réserver un service</h2>
                  <p className="text-slate-500 font-medium">Avec {provider.prenom} {provider.nom}</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Service souhaité</label>
                    <select 
                      required
                      value={formData.serviceId}
                      onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm appearance-none"
                    >
                      <option value="">Sélectionner un service</option>
                      {provider.services.map(s => (
                        <option key={s.service.id} value={s.service.id}>{s.service.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Heure</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required
                          type="time" 
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-elite-emerald transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest text-sm">
                    Continuer vers l'adresse
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <button onClick={() => setStep(1)} className="text-[10px] font-black text-elite-emerald uppercase tracking-widest mb-4 hover:underline">
                    ← Retour aux détails
                  </button>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Lieu de l'intervention</h2>
                  <p className="text-slate-500 font-medium">Où {provider.prenom} doit-il intervenir ?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Adresse complète</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-6 text-slate-300" size={18} />
                      <textarea 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        placeholder="Ex: Quartier Adidogomé, Rue de l'Eglise..."
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <button disabled={isLoading} type="submit" className="w-full py-5 bg-elite-emerald text-white font-black rounded-2xl hover:bg-elite-emerald/90 transition-all shadow-xl shadow-elite-emerald/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    {isLoading ? 'Confirmation...' : 'Confirmer le rendez-vous'}
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 space-y-8">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Demande envoyée !</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Votre demande de rendez-vous a été envoyée à {provider.prenom}. <br />
                    Vous recevrez une notification dès qu'elle sera acceptée.
                  </p>
                </div>
                <button onClick={onClose} className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-elite-emerald transition-all shadow-xl uppercase tracking-widest text-xs">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
