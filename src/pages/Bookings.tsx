import React, { useState, useEffect } from 'react';
import Sidebar, { MobileMenuButton } from '../components/Sidebar';
import { Search, Filter, Calendar, MapPin, Clock, MessageSquare, ChevronRight, MoreVertical, Loader2, CheckCircle2, XCircle, Eye, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import MessageModal from '../components/MessageModal';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [messageRecipient, setMessageRecipient] = useState<any | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <PageHeader
          title={user.role === 'PRESTATAIRE' ? 'Mes Missions' : 'Mes Réservations'}
          fixed
          actions={(
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <button className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-elite-emerald transition-all shadow-lg shadow-slate-900/10 active:scale-95">Tout</button>
              <button className="px-6 py-3 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">En cours</button>
              <button className="px-6 py-3 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Terminé</button>
            </div>
          )}
        />

        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center glass-card rounded-[2.5rem]">
              <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Récupération de vos rendez-vous...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-[2.5rem]">
              <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Aucune réservation trouvée</p>
            </div>
          ) : bookings.map((booking, index) => {
            const partner = user?.role === 'PRESTATAIRE' ? booking.client : booking.prestataire;
            const partnerName = `${partner?.nom || 'Utilisateur'} ${partner?.prenom || ''}`;
            
            return (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-premium relative group hover:-translate-y-1 transition-all"
              >
                <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center font-black text-slate-300 text-2xl overflow-hidden group-hover:scale-105 transition-all uppercase">
                      {partnerName[0]}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 
                          booking.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {booking.status === 'CONFIRMED' ? 'CONFIRMÉ' : 
                           booking.status === 'PENDING' ? 'EN ATTENTE' :
                           booking.status === 'CANCELLED' ? 'ANNULÉ' : 'TERMINÉ'}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID #{booking.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {partnerName}
                      </h3>
                      <p className="text-elite-emerald font-bold text-sm tracking-tight">{booking.service?.nom || 'Service'}</p>
                    </div>
                  </div>
  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-medium text-sm">
                        <Calendar size={18} className="text-elite-gold" />
                        {new Date(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-medium text-sm">
                        <Clock size={18} className="text-elite-gold" />
                        {new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-slate-400 dark:text-slate-500 font-medium text-sm">
                        <MapPin size={18} className="text-elite-gold translate-y-0.5 shrink-0" />
                        <span className="line-clamp-2">{booking.address}</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="xl:pl-8 xl:border-l border-slate-50 flex items-center justify-between xl:justify-end gap-6">
                     <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Montant</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{Number(booking.totalAmount).toLocaleString()} F</p>
                     </div>
                     <div className="flex items-center gap-3">
                      {user.role === 'PRESTATAIRE' && booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                           <button 
                            onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                            className="p-4 bg-elite-emerald text-white rounded-2xl hover:bg-elite-emerald/90 transition-all shadow-lg flex items-center justify-center gap-2 group"
                            title="Confirmer"
                           >
                            <CheckCircle2 size={20} />
                            <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest">Confirmer</span>
                           </button>
                           <button 
                            onClick={() => updateStatus(booking.id, 'CANCELLED')}
                            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                            title="Annuler"
                           >
                            <XCircle size={20} />
                           </button>
                        </div>
                      )}
                      <button
                        onClick={() => setMessageRecipient(partner)}
                        className="p-4 bg-elite-emerald/5 text-elite-emerald rounded-2xl hover:bg-elite-emerald hover:text-white transition-all shadow-sm"
                        title={`Écrire à ${partnerName}`}
                      >
                        <MessageSquare size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-elite-emerald hover:text-white transition-all"
                        title="Voir les détails"
                      >
                        <Eye size={20} />
                      </button>
                      <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-slate-600 rounded-2xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <button className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedBooking(null)} aria-label="Fermer" />
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
              <button onClick={() => setSelectedBooking(null)} className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-900" aria-label="Fermer">
                <X size={22} />
              </button>
              <h2 className="mb-6 text-2xl font-black text-slate-900 dark:text-white">Détails de la réservation</h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>Service :</strong> {selectedBooking.service?.nom || 'Non renseigné'}</p>
                <p><strong>Prestataire :</strong> {selectedBooking.prestataire?.prenom} {selectedBooking.prestataire?.nom}</p>
                <p><strong>Client :</strong> {selectedBooking.client?.prenom} {selectedBooking.client?.nom}</p>
                <p><strong>Date :</strong> {new Date(selectedBooking.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Horaire :</strong> {new Date(selectedBooking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedBooking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Statut :</strong> {selectedBooking.status}</p>
                <p><strong>Adresse :</strong> {selectedBooking.address || 'Non renseignée'}</p>
                {selectedBooking.clientNote && <p><strong>Note :</strong> {selectedBooking.clientNote}</p>}
                {selectedBooking.interventionLatitude != null && selectedBooking.interventionLongitude != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBooking.interventionLatitude},${selectedBooking.interventionLongitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-elite-emerald px-4 py-3 font-black text-white"
                  >
                    <ExternalLink size={16} /> Voir la localisation / itinéraire
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {messageRecipient && (
          <MessageModal
            isOpen={true}
            onClose={() => setMessageRecipient(null)}
            provider={messageRecipient}
          />
        )}
      </main>
    </div>
  );
};

export default Bookings;
