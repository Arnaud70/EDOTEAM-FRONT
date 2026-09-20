import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { getCurrentPosition, reverseGeocode } from '../utils/geocode';

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
  const [busySlots, setBusySlots] = useState<Array<{ startTime: string; endTime: string; status: string }>>([]);
  const [availability, setAvailability] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [interventionLocation, setInterventionLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    startTime: '',
    duration: '1', // in hours
    address: '',
    clientNote: '',
  });
  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ file: File; name: string; url: string }>>([]);

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [selectedPhotos]);

  useEffect(() => {
    if (!isOpen || !provider?.id || !formData.date) return;

    const fetchBusySlots = async () => {
      try {
        const response = await api.get(`/bookings/provider/${provider.id}?date=${formData.date}`);
        const data = response.data?.data || response.data || {};
        setBusySlots(Array.isArray(data) ? data : (data.busySlots || []));
        setAvailability(Array.isArray(data) ? [] : (data.availability || []));
      } catch (err) {
        console.error('Erreur lors du chargement des créneaux occupés:', err);
      }
    };

    fetchBusySlots();
  }, [isOpen, provider?.id, formData.date]);

  const isSlotTaken = (startIso: string, endIso: string) => {
    return busySlots.some((slot) => {
      const slotStart = new Date(slot.startTime).getTime();
      const slotEnd = new Date(slot.endTime).getTime();
      const requestedStart = new Date(startIso).getTime();
      const requestedEnd = new Date(endIso).getTime();
      return requestedStart < slotEnd && requestedEnd > slotStart;
    });
  };

  const timeSlots = React.useMemo(() => {
    if (!formData.date) return [];

    const today = new Date();
    const selectedDate = new Date(`${formData.date}T00:00:00`);
    const isToday = selectedDate.toDateString() === today.toDateString();

    const slots: Array<{ label: string; value: string; busy: boolean; disabled: boolean }> = [];
    for (const range of availability) {
      const rangeStart = new Date(range.startTime);
      const rangeEnd = new Date(range.endTime);
      const startMinutes = rangeStart.getHours() * 60 + rangeStart.getMinutes();
      const endMinutes = rangeEnd.getHours() * 60 + rangeEnd.getMinutes();

      for (let minutes = startMinutes; minutes + 60 <= endMinutes; minutes += 60) {
        const hour = Math.floor(minutes / 60);
        const start = `${String(hour).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        const endMinutesForSlot = minutes + 60;
        const end = `${String(Math.floor(endMinutesForSlot / 60)).padStart(2, '0')}:${String(endMinutesForSlot % 60).padStart(2, '0')}`;
        const startIso = new Date(`${formData.date}T${start}:00`).toISOString();
        const endIso = new Date(`${formData.date}T${end}:00`).toISOString();
        const busy = isSlotTaken(startIso, endIso);

        const slotDateTime = new Date(`${formData.date}T${start}:00`);
        const disabled = isToday && slotDateTime <= today;

        slots.push({
          label: `${start} - ${end}`,
          value: start,
          busy,
          disabled: busy || disabled,
        });
      }
    }

    return slots;
  }, [formData.date, busySlots, availability]);

  const handleSlotSelect = (selectedTime: string) => {
    setFormData((prev) => ({ ...prev, startTime: selectedTime }));
    setError(null);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    if (!files.length) return;

    const nextPhotos = files.map((file) => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setSelectedPhotos((prev) => [...prev, ...nextPhotos].slice(0, 5));
    event.target.value = '';
  };

  const removePhoto = (fileName: string) => {
    setSelectedPhotos((prev) => prev.filter((photo) => photo.name !== fileName));
  };

  const useCurrentLocation = async () => {
    try {
      setLocationError('Récupération de votre position...');
      const { coords } = await getCurrentPosition();
      setInterventionLocation({ latitude: coords.latitude, longitude: coords.longitude });
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      setFormData((prev) => ({ ...prev, address: geo.label }));
      setLocationError('Adresse détectée automatiquement. Vous pouvez la modifier.');
    } catch (locationErrorValue: any) {
      setLocationError(locationErrorValue?.message || 'Position indisponible. Saisissez votre adresse manuellement.');
    }
  };

  if (!isOpen) return null;

  const selectedService = provider.services.find(s => s.service.id === formData.serviceId);
  const indicativePrice = selectedService ? Number(parseFloat(selectedService.prixIndicatif || '0')) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const basePrice = indicativePrice;
      
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60 * 60 * 1000);
      const now = new Date();
      const selectedDateLocal = new Date(`${formData.date}T00:00:00`);

      if (selectedDateLocal.toDateString() === now.toDateString() && startDateTime <= now) {
        setError('Ce créneau est déjà passé. Veuillez sélectionner un autre horaire.');
        return;
      }

      const isWithinAvailability = availability.some((range) => {
        const rangeStart = new Date(range.startTime);
        const rangeEnd = new Date(range.endTime);
        const startMinutes = startDateTime.getHours() * 60 + startDateTime.getMinutes();
        const endMinutes = endDateTime.getHours() * 60 + endDateTime.getMinutes();
        const rangeStartMinutes = rangeStart.getHours() * 60 + rangeStart.getMinutes();
        const rangeEndMinutes = rangeEnd.getHours() * 60 + rangeEnd.getMinutes();
        return startMinutes >= rangeStartMinutes && endMinutes <= rangeEndMinutes;
      });

      if (!isWithinAvailability) {
        setError('Le créneau choisi est en dehors des disponibilités du prestataire.');
        return;
      }

      if (isSlotTaken(startDateTime.toISOString(), endDateTime.toISOString())) {
        setError('Ce prestataire est déjà pris sur ce créneau. Veuillez choisir une autre heure.');
        return;
      }

      const bookingResponse = await api.post('/bookings', {
        prestataireId: provider.id,
        serviceId: formData.serviceId,
        date: startDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalAmount: basePrice,
        address: formData.address,
        clientNote: formData.clientNote.trim() || undefined,
        interventionLatitude: interventionLocation?.latitude,
        interventionLongitude: interventionLocation?.longitude,
      });

      const booking = bookingResponse.data?.data || bookingResponse.data;
      if (selectedPhotos.length > 0 && booking?.id) {
        const photoData = new FormData();
        selectedPhotos.forEach((photo) => photoData.append('photos', photo.file));
        await api.post(`/bookings/${booking.id}/photos`, photoData);
      }

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
          className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 dark:text-slate-500 hover:text-slate-900 z-10">
            <X size={24} />
          </button>

          <div className="p-6 sm:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Réserver un service</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Avec {provider.prenom} {provider.nom}</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Service souhaité</label>
                    {provider.services.length === 0 ? (
                      <div className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-sm">
                        Ce prestataire n'a pas encore ajouté de service. Vous ne pouvez pas réserver pour le moment.
                      </div>
                    ) : (
                      <select 
                        required
                        value={formData.serviceId}
                        onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">Sélectionner un service</option>
                        {provider.services.map(s => (
                          <option key={s.service.id} value={s.service.id}>{s.service.nom}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button type="button" onClick={useCurrentLocation} className="flex items-center gap-2 text-sm font-black text-elite-emerald hover:underline">
                    <MapPin size={18} /> Utiliser ma position actuelle
                  </button>
                  {interventionLocation && <p className="text-xs font-bold text-green-600">Position du lieu enregistrée.</p>}
                  {locationError && <p className="text-xs font-bold text-amber-700">{locationError}</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Heure</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required
                          type="time" 
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.date && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Disponibilités du jour</p>
                      <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {timeSlots.map((slot) => {
                            const isSelected = formData.startTime === slot.value;
                            return (
                              <button
                                key={slot.label}
                                type="button"
                                onClick={() => !slot.disabled && handleSlotSelect(slot.value)}
                                disabled={slot.disabled}
                                className={`rounded-2xl border px-3 py-2 text-xs font-black transition-all ${
                                  slot.disabled
                                    ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed opacity-70'
                                    : isSelected
                                      ? 'bg-elite-emerald text-white border-elite-emerald shadow-md'
                                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-elite-emerald/30 hover:text-elite-emerald'
                                }`}
                                title={slot.disabled ? 'Ce créneau est passé pour aujourd\'hui.' : slot.label}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {busySlots.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Créneaux déjà réservés</p>
                      <div className="flex flex-wrap gap-2">
                        {busySlots.map((slot, index) => (
                          <span key={`${slot.startTime}-${index}`} className="bg-white dark:bg-slate-900 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold">
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={provider.services.length === 0 || !formData.startTime}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-elite-emerald transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Lieu de l'intervention</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Où {provider.prenom} doit-il intervenir ?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Adresse complète</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-6 text-slate-300" size={18} />
                      <textarea 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        placeholder="Ex: Quartier Adidogomé, Rue de l'Eglise..."
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-elite-emerald/20 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-elite-emerald mb-2">Tarif indicatif</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">À partir de {indicativePrice.toLocaleString('fr-FR')} F CFA</p>
                    <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">Le prix final est à convenir avec le prestataire selon la prestation demandée.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Description du problème</label>
                    <textarea
                      value={formData.clientNote}
                      onChange={(e) => setFormData({ ...formData, clientNote: e.target.value })}
                      maxLength={1000}
                      rows={4}
                      placeholder="Décrivez précisément le problème à résoudre, les symptômes et les contraintes éventuelles."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Photos du problème (max. 5)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-2xl file:border-0 file:bg-elite-emerald file:text-white file:text-[10px] file:font-black file:uppercase file:tracking-widest"
                    />
                    {selectedPhotos.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedPhotos.map((photo) => (
                          <div key={photo.name} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800">
                            <img src={photo.url} alt={photo.name} className="h-24 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.name)}
                              className="absolute top-2 right-2 rounded-full bg-slate-900 text-white p-1 text-[10px] font-black"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Demande envoyée !</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
