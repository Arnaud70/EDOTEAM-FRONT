import React from 'react';
import { Calendar, Clock, ExternalLink, MapPin, X } from 'lucide-react';

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  isProvider: boolean;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, isProvider }) => {
  if (!booking) return null;

  const hasCoordinates =
    booking.interventionLatitude != null &&
    booking.interventionLongitude != null &&
    Number.isFinite(Number(booking.interventionLatitude)) &&
    Number.isFinite(Number(booking.interventionLongitude));
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${booking.interventionLatitude},${booking.interventionLongitude}`
    : null;
  const partner = isProvider ? booking.client : booking.prestataire;
  const partnerName = `${partner?.prenom || ''} ${partner?.nom || ''}`.trim() || 'Utilisateur';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
        <button onClick={onClose} className="absolute right-6 top-6 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Fermer">
          <X size={20} />
        </button>
        <h2 className="pr-10 text-2xl font-black text-slate-900 dark:text-white">Détails du rendez-vous</h2>
        <p className="mt-2 font-bold text-elite-emerald">{booking.service?.nom || 'Service'}</p>

        <div className="mt-8 grid gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <p><strong>{isProvider ? 'Client' : 'Prestataire'} :</strong> {partnerName}</p>
          <p><strong>Statut :</strong> {booking.status}</p>
          <p className="flex items-center gap-2"><Calendar size={17} /> {new Date(booking.date).toLocaleDateString('fr-FR')}</p>
          <p className="flex items-center gap-2"><Clock size={17} /> {new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="flex items-start gap-2"><MapPin size={17} className="mt-0.5 shrink-0" /> <span>{booking.address || 'Adresse non renseignée'}</span></p>
          {booking.clientNote && <p><strong>Note du client :</strong> {booking.clientNote}</p>}
          {hasCoordinates && (
            <p className="text-xs text-slate-400">GPS : {booking.interventionLatitude}, {booking.interventionLongitude}</p>
          )}
        </div>

        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-elite-emerald px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-elite-emerald/90">
            <ExternalLink size={17} /> Voir la localisation
          </a>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsModal;
