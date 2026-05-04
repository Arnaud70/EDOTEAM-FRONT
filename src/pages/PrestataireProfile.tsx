import React, { useEffect, useState } from 'react';
import { MapPin, Star, ShieldCheck, Clock, MessageSquare, Calendar, Phone, Share2, Heart, CheckCircle2, Award, Zap, Shield, Loader2, Flag } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import AvisModal from '../components/AvisModal';

interface ProviderData {
  id: string;
  nom: string;
  prenom: string;
  titreProfessionnel: string;
  bio: string;
  localisation: string;
  photoUrl: string;
  emailVerified: boolean;
  services: {
    id: string;
    prixIndicatif: string;
    experience: number;
    service: {
      id: string;
      nom: string;
    };
  }[];
  receivedReviews: {
    id: string;
    note: number;
    commentaire: string;
    createdAt: string;
    client?: {
      nom: string;
      prenom: string;
    };
  }[];
  media: {
    url: string;
    type: string;
  }[];
}

const PrestataireProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isAvisModalOpen, setIsAvisModalOpen] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/providers/${id}`);
        setProvider(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching provider:', err);
        setError('Impossible de charger le profil du prestataire.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProvider();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={48} />
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Chargement du profil d'excellence...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="glass-card p-12 rounded-[3.5rem] text-center max-w-lg">
          <Zap size={48} className="text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-4">Profil Introuvable</h2>
          <p className="text-slate-500 font-medium mb-8">{error || "Ce prestataire n'existe pas ou n'est plus disponible."}</p>
          <Link to="/services" className="px-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald transition-all inline-block">
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = provider.receivedReviews.length > 0
    ? (provider.receivedReviews.reduce((acc, rev) => acc + rev.note, 0) / provider.receivedReviews.length).toFixed(1)
    : "Nouveau";

  const minPrice = provider.services.length > 0
    ? Math.min(...provider.services.map(s => parseFloat(s.prixIndicatif) || 0))
    : 0;

  const gallery = provider.media.filter(m => m.type === 'WORK').map(m => m.url);
  const defaultGallery = [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558444479-c8f010b4886d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7e8b?q=80&w=1200&auto=format&fit=crop"
  ];

  const profileImages = gallery.length > 0 ? gallery : defaultGallery;

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Elite Profile Header */}
        <div className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-premium mb-12 relative group">
          <div className="h-80 bg-elite-emerald relative overflow-hidden">
             {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-elite-gold/20 to-transparent" />
            
            <div className="absolute top-8 right-8 flex gap-4">
              <button className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-elite-emerald transition-all shadow-xl">
                <Share2 size={20} />
              </button>
              <button className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-red-500 transition-all shadow-xl">
                <Heart size={20} />
              </button>
              <button 
                onClick={async () => {
                  if (!user) {
                    navigate('/login', { state: { from: `/profile/${id}` } });
                    return;
                  }
                  if (window.confirm('Voulez-vous vraiment signaler ce profil à l\'administration ?')) {
                    try {
                      await api.post('/reports', {
                        motif: 'Profil suspect',
                        description: 'Signalement direct du profil prestataire',
                        targetUserId: provider.id
                      });
                      alert('Profil signalé avec succès. Merci de votre vigilance.');
                    } catch (err) {
                      alert('Erreur lors du signalement du profil.');
                    }
                  }
                }}
                className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-red-500 transition-all shadow-xl"
                title="Signaler ce profil"
              >
                <Flag size={20} />
              </button>
            </div>
          </div>
          
          <div className="px-12 pb-12 relative">
            <div className="flex flex-col lg:flex-row gap-12 items-end -mt-24">
              <div className="w-48 h-48 rounded-[3rem] border-[10px] border-white overflow-hidden shadow-premium bg-white relative group">
                <img src={provider.photoUrl || profileImages[0]} alt={provider.nom} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/5" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{provider.prenom} {provider.nom}</h1>
                  {provider.emailVerified && (
                    <div className="flex items-center gap-2 px-5 py-2 bg-elite-emerald text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-elite-emerald/20">
                      <Shield size={14} className="text-elite-gold" />
                      <span>Prestataire Certifié</span>
                    </div>
                  )}
                </div>
                <p className="text-elite-emerald font-black text-lg mb-6 tracking-wide flex items-center gap-3">
                  <Zap size={20} className="text-elite-gold" />
                  {provider.titreProfessionnel || "Expert Prestataire"}
                </p>
                <div className="flex flex-wrap gap-8 text-slate-500 font-bold text-sm uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-elite-gold" />
                    <span>{provider.localisation || "Lomé, Togo"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-elite-gold">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <span className="text-slate-900 font-black">{averageRating}</span>
                    <span className="opacity-60">({provider.receivedReviews.length} AVIS)</span>
                  </div>
                </div>
              </div>
              <div className="pb-4 w-full lg:w-auto">
                <button 
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: `/profile/${id}` } });
                      return;
                    }
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full lg:w-auto px-12 py-5 bg-elite-emerald text-white font-black rounded-3xl shadow-xl shadow-elite-emerald/20 hover:bg-elite-emerald/90 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
                >
                  Prendre RDV
                </button>
              </div>
            </div>
          </div>
        </div>

        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          provider={provider} 
        />

        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          provider={provider}
        />

        <AvisModal
          isOpen={isAvisModalOpen}
          onClose={() => setIsAvisModalOpen(false)}
          providerId={provider.id}
          providerName={`${provider.prenom} ${provider.nom}`}
          onSuccess={() => {
            // Re-fetch provider to see the new avis
            const fetchProvider = async () => {
              const response = await api.get(`/users/providers/${id}`);
              setProvider(response.data.data || response.data);
            };
            fetchProvider();
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <section className="glass-card p-12 rounded-[3.5rem] transition-all hover:shadow-2xl hover:border-elite-gold/20">
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Philosophie de Service</h2>
              <p className="text-slate-500 leading-relaxed text-lg font-medium mb-10">
                {provider.bio || "Ce prestataire n'a pas encore renseigné sa philosophie de service."}
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="px-6 py-3 bg-slate-50 text-slate-900 font-black text-xs rounded-2xl border border-slate-100 flex items-center gap-3 uppercase tracking-widest">
                  <CheckCircle2 size={18} className="text-elite-emerald" />
                  Réponse Instantanée
                </span>
                <span className="px-6 py-3 bg-slate-50 text-slate-900 font-black text-xs rounded-2xl border border-slate-100 flex items-center gap-3 uppercase tracking-widest">
                  <CheckCircle2 size={18} className="text-elite-emerald" />
                  Excellence Certifiée
                </span>
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight px-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profileImages.map((img, i) => (
                  <div key={i} className="h-80 rounded-[3rem] overflow-hidden shadow-premium group relative border-4 border-white">
                    <img src={img} alt="réalisation" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card p-12 rounded-[3.5rem]">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Avis de l'Élite</h2>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate('/login', { state: { from: `/profile/${id}` } });
                        return;
                      }
                      setIsAvisModalOpen(true);
                    }}
                    className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-gold hover:text-elite-emerald transition-all"
                  >
                    Laisser un avis
                  </button>
                  <div className="flex items-center gap-3 px-6 py-3 bg-elite-gold/10 rounded-2xl font-black text-elite-emerald">
                    <Star size={24} className="text-elite-gold" fill="currentColor" />
                    {averageRating}
                  </div>
                </div>
              </div>
              <div className="space-y-12">
                {provider.receivedReviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Aucun avis pour le moment</p>
                  </div>
                ) : provider.receivedReviews.map((rev, i) => (
                  <div key={i} className="pb-10 border-b border-slate-50 last:border-0 last:pb-0 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center font-black text-slate-400 group-hover:bg-elite-emerald group-hover:text-white transition-all">
                          {rev.client?.nom?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{rev.client ? `${rev.client.prenom} ${rev.client.nom}` : "Client Anonyme"}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-elite-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < rev.note ? "currentColor" : "none"} stroke={i < rev.note ? "none" : "currentColor"} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-slate-600 font-medium italic text-lg leading-relaxed flex-1">"{rev.commentaire}"</p>
                      <button 
                        onClick={async () => {
                          if (!user) {
                            navigate('/login', { state: { from: `/profile/${id}` } });
                            return;
                          }
                          try {
                            await api.post('/reports', {
                              motif: 'Contenu inapproprié',
                              description: 'Signalement depuis le profil prestataire',
                              avisId: rev.id
                            });
                            alert('Signalement envoyé à l\'administration pour analyse avec succès.');
                          } catch (err) {
                            alert('Une erreur est survenue lors de l\'envoi du signalement.');
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors ml-4"
                      >
                        Signaler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="glass-card p-10 rounded-[3.5rem] border-elite-emerald/5">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Expertises</h2>
              <ul className="space-y-5">
                {provider.services.length === 0 ? (
                  <li className="text-slate-400 text-xs font-bold italic">Aucun service configuré</li>
                ) : provider.services.map((s, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-600 font-bold p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-elite-emerald/5 flex items-center justify-center group-hover:bg-elite-emerald group-hover:text-white transition-all text-elite-emerald">
                       <CheckCircle2 size={18} />
                    </div>
                    {s.service.nom}
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Honoraires Premium</p>
                <p className="text-4xl font-black text-elite-emerald tracking-tight">
                  {minPrice > 0 ? `À partir de ${minPrice.toLocaleString()} F` : "Prix sur devis"}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-elite-gold/10 blur-[60px] rounded-full group-hover:scale-150 transition-all duration-700" />
              
              <h2 className="text-2xl font-black font-heading relative">Besoin d'aide ?</h2>
              <p className="text-slate-400 font-medium leading-relaxed relative">
                Posez vos questions directement à {provider.prenom} pour une étude personnalisée de votre projet.
              </p>
              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: `/profile/${id}` } });
                    return;
                  }
                  setIsMessageModalOpen(true);
                }}
                className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-elite-gold hover:text-elite-emerald transition-all shadow-xl group relative"
              >
                <MessageSquare size={22} />
                Contacter {provider.prenom}
              </button>
              <button className="w-full py-5 bg-white/5 text-white font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all relative">
                <Phone size={22} />
                Appel Sécurisé
              </button>
            </div>

            <div className="p-8 bg-elite-gold/5 border border-elite-gold/20 rounded-[3rem] flex items-center gap-5 transition-all hover:bg-elite-gold/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-elite-emerald">
                <Shield size={32} />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-1">Garantie Excellence</p>
                <p className="text-xs text-slate-500 font-bold">Paiement protégé & Service vérifié par EDOTEAM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestataireProfile;

