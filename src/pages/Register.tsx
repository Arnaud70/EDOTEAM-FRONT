import { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Briefcase, ArrowRight, CheckCircle2, Shield, Zap, Loader2, ShieldCheck, ListPlus, ChevronDown, LocateFixed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  validateName,
  validatePassword,
  validatePhone,
  getPasswordChecks,
  passwordStrengthScore,
} from '../utils/validation';
import { reverseGeocode, getCurrentPosition } from '../utils/geocode';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<'CLIENT' | 'PRESTATAIRE'>('CLIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailAlreadyUsed, setEmailAlreadyUsed] = useState(false);
  
  // États des champs
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [isOtherSpecialite, setIsOtherSpecialite] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordChecks = getPasswordChecks(password);
  const strengthScore = passwordStrengthScore(password);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nomError = validateName(nom, 'Le nom');
    if (nomError) { setError(nomError); return; }

    if (prenom.trim()) {
      const prenomError = validateName(prenom, 'Le prénom');
      if (prenomError) { setError(prenomError); return; }
    }

    if (!telephone.trim()) { setError('Le numéro de téléphone est obligatoire.'); return; }
    const phoneError = validatePhone(telephone);
    if (phoneError) { setError(phoneError); return; }

    if (!region.trim()) { setError('La localisation est obligatoire.'); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (role === 'PRESTATAIRE' && !specialite.trim()) {
      setError('La spécialité est obligatoire pour les prestataires.');
      return;
    }

    if (!acceptedTerms) {
      setError('Vous devez accepter les Normes d’Excellence et la Charte de Confidentialité.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: email.trim(),
        nom: nom.trim(),
        prenom: prenom.trim() || undefined,
        telephone: telephone.trim(),
        motDePasse: password,
        role,
        region: region.trim(),
        specialite: role === 'PRESTATAIRE' ? specialite.trim() : undefined,
        ...coordinates,
      });

      if (result?.emailVerificationRequired) {
        const ttl = result.otpExpiresIn ?? 120;
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}&ttl=${ttl}`);
      } else {
        // Inscription manuelle complète (mode sans SMTP) : rien à compléter.
        navigate('/');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      // Le backend utilise AllExceptionsFilter ou class-validator standard
      const backendError = err.response?.data?.error?.message || err.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
      const message = Array.isArray(backendError) ? backendError[0] : backendError;

      // Un compte peut avoir été créé lors d'une tentative précédente restée sans réponse
      // (connexion lente/coupée) : on oriente vers la connexion plutôt que de laisser une impasse.
      if (err.response?.status === 409) {
        setError(`${message} Il est possible qu'une précédente tentative ait déjà créé ce compte.`);
        setEmailAlreadyUsed(true);
      } else {
        setError(message);
        setEmailAlreadyUsed(false);
      }
    } finally {
      setIsLoading(false);
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
        setRegion(geo.label);
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

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-16 flex flex-col justify-center bg-[#F8FAFC] dark:bg-[#0b1220] px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-elite-emerald/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-elite-gold/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center mb-8 sm:mb-12">
        <div className="flex justify-center mb-6 sm:mb-8 transform hover:rotate-3 transition-transform duration-500">
          <Logo variant="dark" className="scale-110 sm:scale-125" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading mb-3 sm:mb-4">
          Cercle <span className="gold-accent">Privé</span> EDOTEAM
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg max-w-md mx-auto">
          L'excellence à votre service. Rejoignez la première plateforme de talents d'exception au Togo.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-card py-8 px-5 sm:py-12 sm:px-10 rounded-[2rem] sm:rounded-[4rem] border-elite-emerald/5 shadow-2xl">
          {/* Role Selector Premium */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col items-center gap-2 sm:gap-3 border-2 transition-all duration-500 relative overflow-hidden group ${
                role === 'CLIENT' 
                  ? 'border-elite-emerald bg-elite-emerald/5 shadow-xl shadow-elite-emerald/10 scale-105' 
                  : 'border-slate-50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
              }`}
            >
              {role === 'CLIENT' && <div className="absolute top-0 right-0 w-12 h-12 bg-elite-gold/20 blur-xl rounded-full" />}
              <User size={28} className={role === 'CLIENT' ? 'text-elite-emerald' : 'opacity-40'} />
              <span className={`font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center ${role === 'CLIENT' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Particulier Elite</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('PRESTATAIRE')}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col items-center gap-2 sm:gap-3 border-2 transition-all duration-500 relative overflow-hidden group ${
                role === 'PRESTATAIRE'
                  ? 'border-elite-gold bg-elite-gold/5 shadow-xl shadow-elite-gold/10 scale-105'
                  : 'border-slate-50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
              }`}
            >
              {role === 'PRESTATAIRE' && <div className="absolute top-0 right-0 w-12 h-12 bg-elite-emerald/20 blur-xl rounded-full" />}
              <Briefcase size={28} className={role === 'PRESTATAIRE' ? 'text-elite-gold' : 'opacity-40'} />
              <span className={`font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center ${role === 'PRESTATAIRE' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Expert Certifié</span>
            </button>
          </div>

          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex flex-col gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={18} className="text-red-400 shrink-0" />
                  {error}
                </div>
                {emailAlreadyUsed && (
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { prefillEmail: email.trim() } })}
                    className="self-start text-xs font-black uppercase tracking-widest text-elite-emerald hover:underline"
                  >
                    Essayer de me connecter →
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Nom</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                    placeholder="Kouassi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Prénom</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                    placeholder="Jean"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Mobile Elite</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300"
                    placeholder="+228 90 00 00 00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Identifiant Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300" 
                    placeholder="jean@excellence.tg" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Localisation (Région)</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Sécurité</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Confirmation</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            {password.length > 0 && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 space-y-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        strengthScore > i
                          ? strengthScore >= 4
                            ? 'bg-elite-emerald'
                            : strengthScore >= 2
                            ? 'bg-elite-gold'
                            : 'bg-red-400'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {passwordChecks.map((check) => (
                    <li
                      key={check.label}
                      className={`flex items-center gap-2 text-[11px] font-bold ${
                        check.valid ? 'text-elite-emerald' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <CheckCircle2 size={14} className={check.valid ? 'opacity-100' : 'opacity-30'} />
                      {check.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {role === 'PRESTATAIRE' && (
              <div className="p-8 bg-elite-gold/5 rounded-[2.5rem] border border-elite-gold/20 space-y-6 animate-in slide-in-from-top-4 duration-700">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xs uppercase tracking-widest">
                  <Zap size={18} className="text-elite-gold" />
                  Profil d'Expertise
                </h4>
                <div className="space-y-4">
                  <div className="relative z-20">
                    <Briefcase className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors z-40 pointer-events-none ${isDropdownOpen ? 'text-elite-gold' : 'text-slate-400 dark:text-slate-500'}`} size={18} />
                    
                    {/* Overlay to close dropdown */}
                    {isDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                    )}

                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border-2 rounded-2xl cursor-pointer font-bold text-sm outline-none transition-all flex justify-between items-center relative z-40 ${isDropdownOpen ? 'border-elite-gold shadow-lg shadow-elite-gold/10' : 'border-transparent text-slate-700 dark:text-slate-200 hover:shadow-md'}`}
                    >
                      <span className={specialite || isOtherSpecialite ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 font-normal truncate"}>
                        {isOtherSpecialite ? "Autre (nouveau domaine)" : specialite || "Sélectionnez un domaine d'expertise"}
                      </span>
                      <ChevronDown size={20} className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180 text-elite-gold' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                          {services.map(s => (
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
                            Autre (préciser un nouveau domaine)
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
              </div>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-5 w-5 text-elite-emerald focus:ring-elite-emerald border-none rounded-lg bg-slate-100 dark:bg-slate-800"
              />
              <label className="ml-4 text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                Je consens aux <a href="#" className="text-elite-emerald hover:text-elite-gold transition-colors">Normes d'Excellence</a> et à la <a href="#" className="text-elite-emerald hover:text-elite-gold transition-colors">Charte de Confidentialité</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !acceptedTerms}
              className={`w-full py-5 text-white text-sm font-black rounded-3xl shadow-2xl shadow-slate-900/10 transform transition-all active:scale-[0.98] uppercase tracking-[0.2em] flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed ${
                role === 'CLIENT' ? 'bg-slate-900 hover:bg-elite-emerald' : 'bg-elite-emerald hover:bg-slate-900 shadow-elite-emerald/20'
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-elite-gold" size={20} />
              ) : (
                <>
                  Finaliser l'Inscription
                  <ArrowRight size={20} className="text-elite-gold" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mt-4 py-4 text-sm font-black rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-4 hover:bg-slate-50 transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              S'inscrire avec Google
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
          Déjà membre du cercle ?{' '}
          <Link to="/login" className="text-elite-emerald hover:text-elite-gold transition-colors decoration-2 underline-offset-8 underline decoration-elite-gold/30">
            Identifiez-vous ici
          </Link>
        </p>

        <div className="mt-12 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white dark:border-slate-700 py-4 rounded-full shadow-sm font-black uppercase tracking-widest">
          <Shield size={16} className="text-elite-gold" />
          <span>Protection des Données Personnelles Certifiée</span>
        </div>
      </div>
    </div>
  );
};

export default Register;

