import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Briefcase, ArrowRight, ShieldCheck, ChevronDown, Zap, ListPlus, Lock, LocateFixed, Loader2, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatTogoPhone, validateName, validatePhone } from '../utils/validation';
import { reverseGeocode, getCurrentPosition } from '../utils/geocode';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'CLIENT' | 'PRESTATAIRE'>(
    user?.role === 'PRESTATAIRE' ? 'PRESTATAIRE' : 'CLIENT'
  );
  const [telephone, setTelephone] = useState(formatTogoPhone(user?.telephone ?? ''));
  const [localisation, setLocalisation] = useState(user?.localisation ?? '');
  const [specialite, setSpecialite] = useState(user?.titreProfessionnel ?? '');
  const [isOtherSpecialite, setIsOtherSpecialite] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [genre, setGenre] = useState<'HOMME' | 'FEMME' | null>(user?.genre ?? null);
  const existingDocument = user?.media?.find((m) => m.type === 'DOCUMENT');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUploaded, setDocumentUploaded] = useState(!!existingDocument);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data || response.data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };

    fetchServices();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneError = validatePhone(telephone);
    if (phoneError) { setError(phoneError); return; }

    if (!telephone.trim() || !localisation.trim()) {
      setError('Le téléphone et la localisation sont obligatoires.');
      return;
    }

    if (role === 'PRESTATAIRE') {
      if (!specialite.trim()) {
        setError('La spécialité est obligatoire pour les prestataires.');
        return;
      }
      const specError = validateName(specialite, 'La spécialité');
      if (isOtherSpecialite && specError) { setError(specError); return; }

      if (!documentUploaded && !documentFile) {
        setError('Un document justificatif (attestation, carte professionnelle...) est obligatoire pour vous inscrire comme prestataire.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (role === 'PRESTATAIRE' && documentFile) {
        setIsUploadingDocument(true);
        const formData = new FormData();
        formData.append('file', documentFile);
        formData.append('type', 'DOCUMENT');
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const fileUrl = uploadRes.data?.data?.url ?? uploadRes.data?.url;
        const publicId = uploadRes.data?.data?.publicId ?? uploadRes.data?.publicId;
        const resourceType = uploadRes.data?.data?.resourceType ?? uploadRes.data?.resourceType;
        if (!fileUrl) {
          throw new Error("Le fichier n'a pas pu être téléversé (URL manquante dans la réponse du serveur).");
        }
        await api.post('/users/media', { url: fileUrl, type: 'DOCUMENT', publicId, resourceType });
        setDocumentUploaded(true);
        setIsUploadingDocument(false);
      }

      const payload: any = {
        role,
        telephone: telephone.trim(),
        localisation: localisation.trim(),
        ...coordinates,
      };
      if (genre) payload.genre = genre;

      if (role === 'PRESTATAIRE') {
        payload.titreProfessionnel = specialite.trim();
      }

      const response = await api.patch('/users/profile', payload);
      const updatedUser = response.data?.data ?? response.data;
      updateUser(updatedUser);
      navigate('/');
    } catch (err: any) {
      console.error('Error completing profile:', err);
      const backendError = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la mise à jour du profil.';
      setError(Array.isArray(backendError) ? backendError[0] : backendError);
    } finally {
      setIsLoading(false);
      setIsUploadingDocument(false);
    }
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    setLocationMessage('Récupération de votre position...');
    try {
      const { coords } = await getCurrentPosition();
      setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
      try {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        setLocalisation(geo.label);
        setLocationMessage('Adresse détectée automatiquement (modifiable).');
      } catch {
        setLocationMessage('Position enregistrée. Saisissez l’adresse manuellement si besoin.');
      }
    } catch (err: any) {
      setLocationMessage(err?.message || 'Autorisez la localisation ou saisissez votre adresse manuellement.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-16 flex flex-col justify-center bg-[#F8FAFC] dark:bg-[#0b1220] px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-elite-emerald/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-elite-gold/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center mb-12">
        <div className="flex justify-center mb-8 transform hover:rotate-3 transition-transform duration-500">
          <Logo variant="dark" className="scale-125" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading mb-4">
          Compléter votre profil
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto">
          Même page que l'inscription, avec les champs client / prestataire adaptés.
        </p>
        {role === 'PRESTATAIRE' && (
          <p className="mt-4 text-sm font-bold text-elite-gold uppercase tracking-[0.18em]">
            Votre profil sera validé par le super admin avant publication.
          </p>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-card py-12 px-10 rounded-[4rem] border-elite-emerald/5 shadow-2xl">
          <div className="grid grid-cols-2 gap-6 mb-10">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-5 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all duration-500 ${
                role === 'CLIENT'
                  ? 'border-elite-emerald bg-elite-emerald/5 shadow-xl shadow-elite-emerald/10 scale-105'
                  : 'border-slate-50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
              }`}
            >
              <User size={28} className={role === 'CLIENT' ? 'text-elite-emerald' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'CLIENT' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                Particulier Elite
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole('PRESTATAIRE')}
              className={`p-5 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all duration-500 ${
                role === 'PRESTATAIRE'
                  ? 'border-elite-gold bg-elite-gold/5 shadow-xl shadow-elite-gold/10 scale-105'
                  : 'border-slate-50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
              }`}
            >
              <Briefcase size={28} className={role === 'PRESTATAIRE' ? 'text-elite-gold' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'PRESTATAIRE' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                Expert Certifié
              </span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-black uppercase tracking-wider rounded-3xl mb-6 flex items-center gap-3">
              <ShieldCheck size={18} className="text-red-400" />
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">Nom</label>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">Prénom</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="text"
                  readOnly
                  value={user?.nom ?? ''}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="text"
                  readOnly
                  value={user?.prenom ?? ''}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">Identifiant Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="email"
                    readOnly
                    value={user?.email ?? ''}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">Mobile Elite</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(formatTogoPhone(e.target.value))}
                    inputMode="numeric"
                    maxLength={16}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                    placeholder="+228 90 00 00 00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">Localisation (Région)</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                    placeholder="Saisissez votre adresse ou utilisez votre position"
                  />
                </div>
                <button type="button" onClick={useCurrentLocation} disabled={isLocating} className="mt-3 flex items-center gap-2 text-xs font-black text-elite-emerald hover:underline disabled:opacity-50">
                  {isLocating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                  {isLocating ? 'Localisation...' : 'Utiliser ma position actuelle'}
                </button>
                {locationMessage && <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{locationMessage}</p>}
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                <Lock className="text-slate-400 dark:text-slate-500 shrink-0" size={20} />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pour définir ou modifier votre mot de passe, rendez-vous dans <span className="text-elite-emerald">Sécurité</span> après cette étape.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.3em]">
                Genre (pour votre icône de profil)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGenre('HOMME')}
                  className={`py-4 rounded-2xl flex items-center justify-center gap-3 border-2 font-bold text-sm transition-all ${
                    genre === 'HOMME' ? 'border-elite-emerald bg-elite-emerald/5 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <User size={18} className={genre === 'HOMME' ? 'text-elite-emerald' : 'opacity-40'} />
                  Homme
                </button>
                <button
                  type="button"
                  onClick={() => setGenre('FEMME')}
                  className={`py-4 rounded-2xl flex items-center justify-center gap-3 border-2 font-bold text-sm transition-all ${
                    genre === 'FEMME' ? 'border-elite-gold bg-elite-gold/5 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <User size={18} className={genre === 'FEMME' ? 'text-elite-gold' : 'opacity-40'} />
                  Femme
                </button>
              </div>
            </div>

            {role === 'PRESTATAIRE' && (
              <div className="p-8 bg-elite-gold/5 rounded-[2.5rem] border border-elite-gold/20 space-y-6">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xs uppercase tracking-widest">
                  <Zap size={18} className="text-elite-gold" />
                  Profil d’Expertise
                </h4>
                <div className="space-y-4">
                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {services.slice(0, 8).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setIsOtherSpecialite(false);
                            setSpecialite(s.nom);
                          }}
                          className={`px-4 py-2 rounded-2xl border transition-all text-sm font-bold ${specialite === s.nom ? 'bg-elite-gold text-white border-elite-gold' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-elite-emerald hover:text-elite-emerald'}`}
                        >
                          {s.nom}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="relative z-20">
                    <Briefcase className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors text-slate-400 dark:text-slate-500 ${isDropdownOpen ? 'text-elite-gold' : ''}`} size={18} />
                    {isDropdownOpen && (
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                    )}
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border-2 rounded-2xl cursor-pointer font-bold text-sm outline-none transition-all flex justify-between items-center relative z-40 ${
                        isDropdownOpen ? 'border-elite-gold shadow-lg shadow-elite-gold/10' : 'border-transparent text-slate-700 dark:text-slate-200 hover:shadow-md'
                      }`}
                    >
                      <span className={specialite || isOtherSpecialite ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 font-normal truncate'}>
                        {isOtherSpecialite ? 'Autre (nouveau domaine)' : specialite || 'Sélectionnez un domaine d expertise'}
                      </span>
                      <ChevronDown size={20} className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-elite-gold' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                          {services.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setIsOtherSpecialite(false);
                                setSpecialite(s.nom);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center ${!isOtherSpecialite && specialite === s.nom ? 'bg-elite-gold/10 text-elite-gold font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              {s.nom}
                            </div>
                          ))}
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2"></div>
                          <div
                            onClick={() => {
                              setIsOtherSpecialite(true);
                              setSpecialite('');
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${isOtherSpecialite ? 'bg-elite-gold/10 text-elite-gold font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-900'}`}
                          >
                            <div className={`p-1.5 rounded-lg ${isOtherSpecialite ? 'bg-elite-gold/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <ListPlus size={16} className={isOtherSpecialite ? 'text-elite-gold' : 'text-slate-400 dark:text-slate-500'} />
                            </div>
                            Autre (nouveau domaine)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOtherSpecialite && (
                    <div className="relative group animate-in fade-in slide-in-from-top-2">
                      <ListPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-gold transition-colors" size={18} />
                      <input
                        type="text"
                        required={role === 'PRESTATAIRE' && isOtherSpecialite}
                        value={specialite}
                        onChange={(e) => setSpecialite(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-elite-gold font-bold text-slate-700 dark:text-slate-200 text-sm outline-none placeholder:text-slate-300"
                        placeholder="Veuillez préciser votre domaine..."
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-elite-gold/20">
                  <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xs uppercase tracking-widest mt-6 mb-4">
                    <FileText size={18} className="text-elite-gold" />
                    Document justificatif <span className="text-red-500">*</span>
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Attestation de service, carte professionnelle ou tout document prouvant votre qualification. Il sera envoyé au super admin pour vérification — votre profil ne sera visible publiquement qu'une fois validé.
                  </p>

                  {documentUploaded && !documentFile ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 size={20} />
                      Document déjà envoyé — en attente de vérification.
                      <label className="ml-auto text-xs underline cursor-pointer">
                        Remplacer
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif,application/pdf"
                          className="hidden"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-elite-gold/40 cursor-pointer hover:border-elite-gold transition-all">
                      <UploadCloud size={24} className="text-elite-gold shrink-0" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                        {documentFile ? documentFile.name : 'Choisir un fichier (PDF, JPG, PNG — 10 Mo max)'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,application/pdf"
                        className="hidden"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-70"
            >
              {isUploadingDocument ? 'Envoi du document...' : isLoading ? 'Chargement...' : 'Terminer l’inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
