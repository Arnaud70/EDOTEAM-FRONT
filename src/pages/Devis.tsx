import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock3, Edit3, FileDown, ImageIcon, Loader2, MapPin, MessageSquare, Send, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { getCurrentPosition, reverseGeocode } from '../utils/geocode';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { downloadBrandedPdf } from '../utils/exportPdf';

interface DevisPhoto {
  id: string;
  url: string;
  name: string;
}

interface DevisItem {
  id: string;
  statut: string;
  descriptionProbleme: string;
  localisation: string;
  disponibilites: string;
  prixIndicatif: number | string | null;
  prixPropose: number | string | null;
  notePrestataire?: string | null;
  createdAt: string;
  photos: DevisPhoto[];
  service?: { nom: string };
  prestataire?: { id: string; nom: string; prenom: string };
  client?: { id: string; nom: string; prenom: string };
  localisationLatitude?: number | null;
  localisationLongitude?: number | null;
}

const statusLabel: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  SOUMIS: 'Soumis',
  REFUSE_PAR_PRESTATAIRE: 'Refusé par prestataire',
  REFUSE_PAR_CLIENT: 'Refusé par client',
  EN_NEGOCIATION: 'En négociation',
  ACCEPTE: 'Accepté',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé',
  CLOTURE: 'Clôturé',
};

const Devis = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [devis, setDevis] = useState<DevisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [providerIdParam, setProviderIdParam] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quoteInputs, setQuoteInputs] = useState<Record<string, { price: string; note: string }>>({});
  const [availability, setAvailability] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [locationMessage, setLocationMessage] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<DevisPhoto | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [refusalForm, setRefusalForm] = useState<{
    devisId: string;
    reason: string;
    message: string;
  } | null>(null);
  const [editingDevis, setEditingDevis] = useState<DevisItem | null>(null);
  const [editDevisForm, setEditDevisForm] = useState({ descriptionProbleme: '', localisation: '', disponibilites: '' });
  const [form, setForm] = useState({
    prestataireId: '',
    serviceId: '',
    descriptionProbleme: '',
    localisation: '',
    disponibilites: '',
    date: '',
    startTime: '',
  });

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const prestataireId = query.get('prestataireId');
    setProviderIdParam(prestataireId);
    if (prestataireId) {
      setForm((prev) => ({ ...prev, prestataireId }));
      api.get(`/users/providers/${prestataireId}`)
        .then((response) => {
          const data = response.data?.data || response.data || {};
          setProviderInfo(data);
          if (data?.services?.[0]?.service?.id) {
            setForm((prev) => ({ ...prev, serviceId: data.services[0].service.id }));
          }
        })
        .catch(() => undefined);
    }
  }, [query]);

  useEffect(() => {
    if (!providerIdParam || !form.date) return;
    api.get(`/bookings/provider/${providerIdParam}?date=${form.date}`)
      .then((response) => {
        const data = response.data?.data || response.data || {};
        setAvailability(Array.isArray(data) ? [] : data.availability || []);
      })
      .catch(() => setAvailability([]));
  }, [providerIdParam, form.date]);

  const timeSlots = useMemo(() => {
    if (!form.date) return [];
    const now = new Date();
    const selectedDate = new Date(`${form.date}T00:00:00`);
    const isToday = selectedDate.toDateString() === now.toDateString();
    return availability.flatMap((range) => {
      const start = new Date(range.startTime);
      const end = new Date(range.endTime);
      const slots: string[] = [];
      for (let minutes = start.getHours() * 60 + start.getMinutes(); minutes + 60 <= end.getHours() * 60 + end.getMinutes(); minutes += 60) {
        const slot = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        const slotDateTime = new Date(`${form.date}T${slot}:00`);
        if (!isToday || slotDateTime > now) slots.push(slot);
      }
      return slots;
    });
  }, [availability, form.date]);

  const useCurrentLocation = async () => {
    try {
      setLocating(true);
      setLocationMessage('Récupération de votre position...');
      const { coords } = await getCurrentPosition();
      setLocationCoords({ latitude: coords.latitude, longitude: coords.longitude });
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      setForm((previous) => ({ ...previous, localisation: geo.label }));
      setLocationMessage('Adresse détectée automatiquement. Vous pouvez la modifier.');
    } catch (locationError: any) {
      setLocationMessage(locationError?.message || 'Position indisponible. Saisissez votre adresse manuellement.');
    } finally {
      setLocating(false);
    }
  };

  const fetchDevis = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('/devis');
      setDevis(response.data?.data || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de récupérer les devis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, [user]);

  const submitDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'CLIENT') {
      setError('Vous devez être connecté en tant que client pour créer un devis.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (form.descriptionProbleme.trim().length < 20) {
        setError('Décrivez votre besoin en au moins 20 caractères pour permettre au prestataire de préparer un devis précis.');
        return;
      }
      if (!form.date || !form.startTime) {
        setError('Choisissez une date et un créneau proposé par le prestataire.');
        return;
      }

      const payload = {
        prestataireId: form.prestataireId,
        serviceId: form.serviceId,
        descriptionProbleme: form.descriptionProbleme,
        localisation: form.localisation,
        disponibilites: `${new Date(`${form.date}T${form.startTime}`).toLocaleDateString('fr-FR')} à ${form.startTime}${form.disponibilites.trim() ? ` - ${form.disponibilites.trim()}` : ''}`,
        localisationLatitude: locationCoords?.latitude,
        localisationLongitude: locationCoords?.longitude,
      };

      const response = await api.post('/devis', payload);
      const created = response.data?.data || response.data;

      if (selectedFiles.length > 0 && created?.id) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('photos', file));
        // Laisser Axios définir automatiquement le boundary multipart.
        await api.post(`/devis/${created.id}/photos`, formData);
      }

      setSelectedFiles([]);
      setForm({
        prestataireId: form.prestataireId,
        serviceId: '',
        descriptionProbleme: '',
        localisation: '',
        disponibilites: '',
        date: '',
        startTime: '',
      });
      setLocationCoords(null);
      setDevis((current) => [created, ...current]);
      navigate('/devis');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erreur lors de la création du devis.'));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadDevis = async (item: DevisItem) => {
    const generatedAt = new Date();
    await downloadBrandedPdf({
      title: item.service?.nom || 'Prestation',
      subtitle: 'Document de suivi de votre demande de devis',
      badge: 'Reçu de devis',
      rows: [
        { label: 'Client', value: `${item.client?.prenom || ''} ${item.client?.nom || ''}`.trim() },
        { label: 'Prestataire', value: `${item.prestataire?.prenom || ''} ${item.prestataire?.nom || ''}`.trim() },
        { label: 'Description', value: item.descriptionProbleme },
        { label: 'Lieu', value: item.localisation },
        { label: 'Disponibilité', value: item.disponibilites },
        { label: 'Statut', value: statusLabel[item.statut] || item.statut },
        ...(item.notePrestataire ? [{ label: 'Détails du prestataire', value: item.notePrestataire }] : []),
        { label: 'Référence', value: item.id },
        { label: 'Édité le', value: `${generatedAt.toLocaleDateString('fr-FR')} à ${generatedAt.toLocaleTimeString('fr-FR')}` },
      ],
      accentValue: item.prixPropose
        ? `Prix proposé : ${Number(item.prixPropose).toLocaleString('fr-FR')} F CFA`
        : 'Prix final à convenir avec le prestataire',
      qrText: `EDOTEAM|DEVIS|${item.id}|${statusLabel[item.statut] || item.statut}|${generatedAt.toISOString()}`,
      filename: `edoteam-devis-${item.id.slice(0, 8)}.pdf`,
    });
  };

  const submitPrice = async (id: string, prix: string, note: string) => {
    const cleaned = Number(prix);
    if (!Number.isFinite(cleaned) || cleaned < 0) {
      setError('Le prix proposé doit être un nombre valide.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.patch(`/devis/${id}/soumettre`, { prixPropose: cleaned, note });
      const updated = response.data?.data || response.data;
      setDevis((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du devis.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDevisEditor = (item: DevisItem) => {
    setEditingDevis(item);
    setEditDevisForm({ descriptionProbleme: item.descriptionProbleme, localisation: item.localisation, disponibilites: item.disponibilites });
  };

  const updateDevis = async () => {
    if (!editingDevis) return;
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.patch(`/devis/${editingDevis.id}`, editDevisForm);
      const updated = response.data?.data || response.data;
      setDevis((current) => current.map((item) => item.id === editingDevis.id ? { ...item, ...updated } : item));
      setEditingDevis(null);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Impossible de modifier la demande de devis.'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateQuoteInput = (id: string, field: 'price' | 'note', value: string) => {
    setQuoteInputs((previous) => ({
      ...previous,
      [id]: { price: previous[id]?.price || '', note: previous[id]?.note || '', [field]: value },
    }));
  };

  const acceptOrRefuse = async (id: string, accept: boolean) => {
    if (accept && !window.confirm('En acceptant ce prix, vous confirmez votre intention de réserver ce prestataire. Le rendez-vous sera définitivement créé après le Dernier OK du prestataire. Continuer ?')) return;
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.patch(`/devis/${id}/decision-client`, {
        acceptationClient: accept,
        motifRefusClient: accept ? undefined : 'PRIX_TROP_ELEVE',
        motifRefusClientLibre: undefined,
      });
      const updated = response.data?.data || response.data;
      setDevis((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erreur lors de la décision client.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitClientRefusal = async () => {
    if (!refusalForm) return;
    if (!refusalForm.reason) {
      setError('Sélectionnez la raison de votre refus.');
      return;
    }

    const selectedDevis = devis.find((item) => item.id === refusalForm.devisId);
    if (!selectedDevis?.prestataire?.id) {
      setError('Prestataire introuvable pour ce devis.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.patch(`/devis/${refusalForm.devisId}/decision-client`, {
        acceptationClient: false,
        motifRefusClient: refusalForm.reason,
        motifRefusClientLibre: refusalForm.message.trim() || undefined,
      });
      const updated = response.data?.data || response.data;

      const isPriceReason = ['BUDGET_INSUFFISANT', 'PRIX_TROP_ELEVE'].includes(refusalForm.reason);
      if (isPriceReason && refusalForm.message.trim()) {
        await api.post('/messages', {
          receiverId: selectedDevis.prestataire.id,
          content: `Concernant le devis pour ${selectedDevis.service?.nom || 'la prestation'} : ${refusalForm.message.trim()}`,
        });
      }

      setRefusalForm(null);
      setDevis((current) => current.map((item) => item.id === refusalForm.devisId ? { ...item, ...updated } : item));
      if (isPriceReason && refusalForm.message.trim()) {
        navigate('/messages');
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erreur lors de l’enregistrement de votre refus.'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmLastOk = async (id: string) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.patch(`/devis/${id}/dernier-ok`);
      const updated = response.data?.data || response.data;
      setDevis((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Impossible de confirmer le rendez-vous.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0b1220]">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-premium">
          <AlertCircle className="mx-auto mb-4 text-amber-500" size={42} />
          <h2 className="text-2xl font-black text-slate-900 mb-3">Connexion requise</h2>
          <p className="text-slate-500">Connectez-vous pour gérer vos devis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <PageHeader title="Mes devis" fixed actions={user.role === 'CLIENT' && !providerIdParam ? (
            <button
              onClick={() => navigate('/services')}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white"
            >
              Trouver un prestataire
            </button>
          ) : undefined} />

        <div className="mx-auto max-w-6xl space-y-8 pt-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-elite-emerald">Workflow devis</p>
            <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">Demande de devis & prix final</h1>
          </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {user.role === 'CLIENT' && providerIdParam && providerInfo && (
          <form onSubmit={submitDevis} className="rounded-[2rem] bg-white p-6 shadow-premium">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-2xl font-black text-slate-900">Nouvelle demande de devis</h2>
              <p className="text-slate-500">
                Pour {providerInfo.prenom} {providerInfo.nom} • {providerInfo.titreProfessionnel || 'Prestataire'}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-500">Décrivez votre besoin, indiquez le lieu et choisissez un créneau proposé par le prestataire. Il vous enverra ensuite son prix final.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Service</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none"
                  required
                >
                  <option value="">Choisir un service</option>
                  {providerInfo.services?.map((service: any) => (
                    <option key={service.service.id} value={service.service.id}>{service.service.nom}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Description détaillée du besoin</label>
                  <span className="text-xs text-slate-400">20 caractères minimum</span>
                </div>
                <textarea
                  value={form.descriptionProbleme}
                  onChange={(e) => setForm({ ...form, descriptionProbleme: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none"
                  placeholder="Exemple : Je souhaite installer un site vitrine de 5 pages avec formulaire de contact..."
                  required
                />
              </div>

              <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-800"><MapPin size={16} /> Lieu de la prestation</label>
                  <button type="button" onClick={useCurrentLocation} disabled={locating} className="text-xs font-black text-elite-emerald hover:underline disabled:opacity-50">{locating ? 'Localisation...' : 'Utiliser ma position'}</button>
                </div>
                <input
                  value={form.localisation}
                  onChange={(e) => setForm({ ...form, localisation: e.target.value })}
                  className="mt-3 w-full rounded-2xl border border-emerald-100 bg-white p-4 outline-none"
                  placeholder="Adresse détectée automatiquement ou saisissez-la"
                  required
                />
                {locationMessage && <p className="mt-2 text-xs font-bold text-emerald-700">{locationMessage}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><Calendar size={15} /> Date souhaitée</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value, startTime: '' })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><Clock3 size={15} /> Créneau prestataire</label>
                <select
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none"
                  required
                  disabled={!form.date}
                >
                  <option value="">{form.date ? 'Choisir un créneau disponible' : 'Choisir une date d’abord'}</option>
                  {timeSlots.map((slot) => <option key={slot} value={slot}>{slot} - {String(Number(slot.slice(0, 2)) + 1).padStart(2, '0')}:{slot.slice(3)}</option>)}
                </select>
                {form.date && timeSlots.length === 0 && <p className="mt-2 text-xs font-bold text-amber-700">Aucun créneau disponible ce jour. Choisissez une autre date.</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Précisions sur vos disponibilités</label>
                <input
                  value={form.disponibilites}
                  onChange={(e) => setForm({ ...form, disponibilites: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none"
                  placeholder="Exemple : joignable toute la journée, accès au domicile confirmé"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Photos du besoin</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []).slice(0, 5))}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <span key={`${file.name}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-elite-emerald/10 px-3 py-1 text-xs font-bold text-elite-emerald">
                        {file.name}
                        <button
                          type="button"
                          onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                          className="rounded-full p-0.5 text-elite-emerald hover:bg-elite-emerald hover:text-white"
                          aria-label={`Supprimer ${file.name}`}
                          title="Supprimer cette photo"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-elite-emerald px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white disabled:opacity-60"
              >
                {submitting ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-premium">
              <Loader2 className="mx-auto animate-spin text-elite-gold" size={32} />
            </div>
          ) : devis.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-premium">
              <ImageIcon className="mx-auto mb-4 text-slate-300" size={46} />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Aucun devis pour le moment</p>
            </div>
          ) : (
            devis.map((item) => {
              const isProvider = user.role === 'PRESTATAIRE';
              const isClient = user.role === 'CLIENT';
              const partnerName = isProvider ? `${item.client?.prenom || ''} ${item.client?.nom || ''}`.trim() : `${item.prestataire?.prenom || ''} ${item.prestataire?.nom || ''}`.trim();

              return (
                <div key={item.id} className="rounded-[2rem] bg-white p-6 shadow-premium">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="rounded-full bg-elite-emerald/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-elite-emerald">
                          {statusLabel[item.statut] || item.statut}
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{item.service?.nom || 'Service'}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{partnerName || 'Demande devis'}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="flex items-center gap-2"><Clock3 size={15} /> {new Date(item.createdAt).toLocaleDateString('fr-FR')}</div>
                      {isClient && item.statut === 'EN_ATTENTE' && (
                        <button type="button" onClick={() => openDevisEditor(item)} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:bg-elite-emerald hover:text-white" title="Modifier la demande">
                          <Edit3 size={15} />
                        </button>
                      )}
                      <button type="button" onClick={() => downloadDevis(item)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-elite-emerald hover:text-elite-emerald">
                        <FileDown size={15} /> Télécharger
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</p>
                        <p className="text-slate-600">{item.descriptionProbleme}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lieu</p>
                          <p className="text-slate-600">{item.localisation}</p>
                          {item.localisationLatitude != null && item.localisationLongitude != null && (
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${item.localisationLatitude},${item.localisationLongitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-black text-elite-emerald hover:underline">
                              <MapPin size={14} /> Voir l’itinéraire
                            </a>
                          )}
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Disponibilités</p>
                          <p className="text-slate-600">{item.disponibilites}</p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prix indicatif</p>
                        <p className="text-lg font-black text-slate-900">
                          {item.prixIndicatif ? `${Number(item.prixIndicatif).toLocaleString('fr-FR')} F CFA` : 'À définir'}
                        </p>
                      </div>

                      {item.photos?.length > 0 && (
                        <div>
                          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Photos jointes</p>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {item.photos.map((photo) => (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => { setPhotoLoading(true); setPreviewPhoto(photo); }}
                                className="group relative h-28 w-full overflow-hidden rounded-2xl bg-slate-100"
                                aria-label={`Agrandir ${photo.name}`}
                              >
                                <img
                                  src={photo.url.startsWith('http') ? photo.url : `http://localhost:3000${photo.url}`}
                                  alt={photo.name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/35 text-xs font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">Agrandir</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
                      {isProvider && item.statut === 'EN_ATTENTE' && (
                        <div className="space-y-4 rounded-2xl border-2 border-elite-emerald/30 bg-white p-4 shadow-sm">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-elite-emerald">Action prestataire</p>
                            <h4 className="mt-1 text-lg font-black text-slate-900">Définir le prix final</h4>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Saisissez votre montant, puis envoyez-le au client pour validation.</p>
                          </div>
                          <label className="block text-xs font-black text-slate-700" htmlFor={`prix-${item.id}`}>Montant proposé (F CFA)</label>
                          <input
                            id={`prix-${item.id}`}
                            type="number"
                            min="0"
                            value={quoteInputs[item.id]?.price ?? ''}
                            onChange={(event) => updateQuoteInput(item.id, 'price', event.target.value)}
                            className="w-full rounded-2xl border-2 border-elite-emerald/40 bg-white p-4 text-xl font-black text-slate-900 outline-none focus:border-elite-emerald"
                            placeholder="Ex. 75 000"
                            required
                          />
                          <textarea
                            value={quoteInputs[item.id]?.note ?? ''}
                            onChange={(event) => updateQuoteInput(item.id, 'note', event.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none"
                            placeholder="Précisez ce qui est inclus dans ce prix (facultatif)"
                          />
                          <button
                            onClick={() => submitPrice(item.id, quoteInputs[item.id]?.price ?? '', quoteInputs[item.id]?.note ?? '')}
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-elite-emerald px-4 py-4 text-xs font-black uppercase tracking-[0.15em] text-white disabled:opacity-60"
                          >
                            <Send size={15} /> Envoyer le prix au client
                          </button>
                        </div>
                      )}

                      {isProvider && item.statut === 'SOUMIS' && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Devis envoyé</p>
                          <p className="mt-1 text-sm font-bold text-amber-900">Le prix final est en attente de validation par le client.</p>
                        </div>
                      )}

                      {isProvider && item.statut === 'ACCEPTE' && (
                        <div className="space-y-3 rounded-2xl border-2 border-elite-emerald/30 bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-elite-emerald">Action prestataire</p>
                          <h4 className="text-lg font-black text-slate-900">Le client a accepté le prix</h4>
                          <p className="text-xs leading-5 text-slate-500">Laissez votre Dernier OK pour confirmer le rendez-vous et clôturer l’accord.</p>
                          <button
                            type="button"
                            onClick={() => confirmLastOk(item.id)}
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-elite-emerald px-4 py-4 text-xs font-black uppercase tracking-[0.15em] text-white disabled:opacity-60"
                          >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            {submitting ? 'Confirmation...' : 'Donner mon Dernier OK'}
                          </button>
                        </div>
                      )}

                      {isClient && item.statut === 'SOUMIS' && (
                        <div className="space-y-3">
                          <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
                            <p className="font-black">Prix proposé</p>
                            <p className="text-xl font-black">{Number(item.prixPropose || 0).toLocaleString('fr-FR')} F CFA</p>
                          </div>
                          <p className="text-xs font-bold leading-5 text-slate-500">En acceptant, vous réservez ce prestataire. La réservation sera confirmée dans vos réservations après son Dernier OK.</p>
                          <div className="flex gap-2">
                            <button onClick={() => acceptOrRefuse(item.id, true)} className="flex-1 rounded-2xl bg-elite-emerald px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white">
                              Accepter
                            </button>
                            <button onClick={() => setRefusalForm({ devisId: item.id, reason: '', message: '' })} className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white">
                              Refuser
                            </button>
                          </div>
                        </div>
                      )}

                      {item.prixPropose ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prix proposé par le prestataire</p>
                          <p className="mt-2 text-lg font-black text-slate-900">
                            {Number(item.prixPropose).toLocaleString('fr-FR')} F CFA
                          </p>
                          {item.notePrestataire && <p className="mt-2 text-xs text-slate-500">{item.notePrestataire}</p>}
                        </div>
                      ) : item.prixIndicatif ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tarif indicatif</p>
                          <p className="mt-2 text-lg font-black text-slate-900">{Number(item.prixIndicatif).toLocaleString('fr-FR')} F CFA</p>
                          <p className="mt-1 text-xs text-slate-500">Le prix final sera proposé par le prestataire.</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-sm"
          onClick={() => { setPreviewPhoto(null); setPhotoLoading(false); }}
        >
          <button
            type="button"
            onClick={() => { setPreviewPhoto(null); setPhotoLoading(false); }}
            className="absolute right-6 top-6 rounded-2xl bg-white/10 p-3 text-white hover:bg-white hover:text-slate-900"
            aria-label="Fermer l’image"
          >
            <X size={24} />
          </button>
          <div className="relative flex min-h-40 min-w-40 items-center justify-center" onClick={(event) => event.stopPropagation()}>
            {photoLoading && <Loader2 size={42} className="absolute animate-spin text-white" />}
            <img
              src={previewPhoto.url.startsWith('http') ? previewPhoto.url : `http://localhost:3000${previewPhoto.url}`}
              alt={previewPhoto.name}
              onLoad={() => setPhotoLoading(false)}
              onError={() => setPhotoLoading(false)}
              className={`max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl transition-opacity duration-200 ${photoLoading ? 'opacity-30' : 'opacity-100'}`}
            />
          </div>
        </div>
      )}

      {refusalForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Réponse au devis</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Pourquoi refusez-vous ce prix ?</h2>
              </div>
              <button type="button" onClick={() => setRefusalForm(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                Motif du refus
                <select
                  value={refusalForm.reason}
                  onChange={(event) => setRefusalForm((previous) => previous ? { ...previous, reason: event.target.value, message: ['BUDGET_INSUFFISANT', 'PRIX_TROP_ELEVE'].includes(event.target.value) ? previous.message : '' } : previous)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-elite-emerald dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="BUDGET_INSUFFISANT">Le prix dépasse mon budget</option>
                  <option value="PRIX_TROP_ELEVE">Le prix est trop élevé</option>
                  <option value="DELAI_TROP_LONG">Le délai est trop long</option>
                  <option value="PLUS_INTERESSE">Je ne suis plus intéressé</option>
                  <option value="AUTRE">Autre raison</option>
                </select>
              </label>

              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                {['BUDGET_INSUFFISANT', 'PRIX_TROP_ELEVE'].includes(refusalForm.reason) ? 'Message au prestataire pour négocier (facultatif)' : 'Précision (facultatif)'}
                <textarea
                  value={refusalForm.message}
                  onChange={(event) => setRefusalForm((previous) => previous ? { ...previous, message: event.target.value } : previous)}
                  maxLength={1000}
                  rows={4}
                  placeholder={['BUDGET_INSUFFISANT', 'PRIX_TROP_ELEVE'].includes(refusalForm.reason) ? 'Exemple : Est-il possible de revoir le prix ?' : 'Ajoutez une précision pour le prestataire...'}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-elite-emerald dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              {['BUDGET_INSUFFISANT', 'PRIX_TROP_ELEVE'].includes(refusalForm.reason) && (
                <div className="flex gap-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  <MessageSquare size={18} className="mt-0.5 shrink-0" />
                  <p>Votre devis passera en négociation. Si vous écrivez un message, il sera envoyé directement au prestataire.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRefusalForm(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Annuler
                </button>
                <button type="button" onClick={submitClientRefusal} disabled={submitting} className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
                  {submitting ? 'Enregistrement...' : 'Confirmer le refus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingDevis && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-elite-emerald">Demande en attente</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Modifier ma demande de devis</h2>
              </div>
              <button type="button" onClick={() => setEditingDevis(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fermer"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Description du besoin
                <textarea value={editDevisForm.descriptionProbleme} onChange={(event) => setEditDevisForm((previous) => ({ ...previous, descriptionProbleme: event.target.value }))} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-elite-emerald dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Lieu de la prestation
                <input value={editDevisForm.localisation} onChange={(event) => setEditDevisForm((previous) => ({ ...previous, localisation: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-elite-emerald dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Date, créneau et disponibilités
                <input value={editDevisForm.disponibilites} onChange={(event) => setEditDevisForm((previous) => ({ ...previous, disponibilites: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-elite-emerald dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingDevis(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 dark:border-slate-700 dark:text-slate-300">Annuler</button>
                <button type="button" onClick={updateDevis} disabled={submitting} className="rounded-xl bg-elite-emerald px-5 py-3 text-sm font-black text-white disabled:opacity-60">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default Devis;
