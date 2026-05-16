import { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Briefcase, ArrowRight, CheckCircle2, Shield, Zap, Loader2, ShieldCheck, ListPlus, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<'CLIENT' | 'PRESTATAIRE'>('CLIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        email,
        nom,
        prenom,
        telephone,
        motDePasse: password,
        role,
        region,
        specialite: role === 'PRESTATAIRE' ? specialite : undefined,
      });
      navigate('/');
    } catch (err: any) {
      console.error('Register error:', err);
      // Le backend utilise AllExceptionsFilter ou class-validator standard
      const backendError = err.response?.data?.error?.message || err.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
      setError(Array.isArray(backendError) ? backendError[0] : backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col justify-center bg-[#F8FAFC] px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-elite-emerald/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-elite-gold/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center mb-12">
        <div className="flex justify-center mb-8 transform hover:rotate-3 transition-transform duration-500">
          <Logo variant="dark" className="scale-125" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading mb-4">
          Cercle <span className="gold-accent">Privé</span> EDOTEAM
        </h2>
        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
          L'excellence à votre service. Rejoignez la première plateforme de talents d'exception au Togo.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-card py-12 px-10 rounded-[4rem] border-elite-emerald/5 shadow-2xl">
          {/* Role Selector Premium */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setRole('CLIENT')}
              className={`p-6 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all duration-500 relative overflow-hidden group ${
                role === 'CLIENT' 
                  ? 'border-elite-emerald bg-elite-emerald/5 shadow-xl shadow-elite-emerald/10 scale-105' 
                  : 'border-slate-50 text-slate-400 hover:border-slate-200'
              }`}
            >
              {role === 'CLIENT' && <div className="absolute top-0 right-0 w-12 h-12 bg-elite-gold/20 blur-xl rounded-full" />}
              <User size={32} className={role === 'CLIENT' ? 'text-elite-emerald' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'CLIENT' ? 'text-slate-900' : 'text-slate-400'}`}>Particulier Elite</span>
            </button>
            <button
              onClick={() => setRole('PRESTATAIRE')}
              className={`p-6 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all duration-500 relative overflow-hidden group ${
                role === 'PRESTATAIRE' 
                  ? 'border-elite-gold bg-elite-gold/5 shadow-xl shadow-elite-gold/10 scale-105' 
                  : 'border-slate-50 text-slate-400 hover:border-slate-200'
              }`}
            >
              {role === 'PRESTATAIRE' && <div className="absolute top-0 right-0 w-12 h-12 bg-elite-emerald/20 blur-xl rounded-full" />}
              <Briefcase size={32} className={role === 'PRESTATAIRE' ? 'text-elite-gold' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'PRESTATAIRE' ? 'text-slate-900' : 'text-slate-400'}`}>Expert Certifié</span>
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <ShieldCheck size={18} className="text-red-400" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Nom & Prénoms</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="Jean Kouassi" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Mobile Elite</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="tel" 
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="+228 90 00 00 00" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Identifiant Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="jean@excellence.tg" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Localisation (Région)</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="Lomé, Maritime..." 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Sécurité</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Confirmation</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            {role === 'PRESTATAIRE' && (
              <div className="p-8 bg-elite-gold/5 rounded-[2.5rem] border border-elite-gold/20 space-y-6 animate-in slide-in-from-top-4 duration-700">
                <h4 className="font-black text-slate-900 flex items-center gap-3 text-xs uppercase tracking-widest">
                  <Zap size={18} className="text-elite-gold" />
                  Profil d'Expertise
                </h4>
                <div className="space-y-4">
                  <div className="relative z-20">
                    <Briefcase className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors z-40 pointer-events-none ${isDropdownOpen ? 'text-elite-gold' : 'text-slate-400'}`} size={18} />
                    
                    {/* Overlay to close dropdown */}
                    {isDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                    )}

                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-14 pr-5 py-4 bg-white border-2 rounded-2xl cursor-pointer font-bold text-sm outline-none transition-all flex justify-between items-center relative z-40 ${isDropdownOpen ? 'border-elite-gold shadow-lg shadow-elite-gold/10' : 'border-transparent text-slate-700 hover:shadow-md'}`}
                    >
                      <span className={specialite || isOtherSpecialite ? "text-slate-900" : "text-slate-400 font-normal truncate"}>
                        {isOtherSpecialite ? "Autre (nouveau domaine)" : specialite || "Sélectionnez un domaine d'expertise"}
                      </span>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180 text-elite-gold' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                          {services.map(s => (
                            <div 
                              key={s.id} 
                              onClick={() => {
                                setIsOtherSpecialite(false);
                                setSpecialite(s.nom);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center ${!isOtherSpecialite && specialite === s.nom ? 'bg-elite-gold/10 text-elite-gold font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              {s.nom}
                            </div>
                          ))}
                          <div className="h-px bg-slate-100 my-2 mx-2"></div>
                          <div 
                            onClick={() => {
                              setIsOtherSpecialite(true);
                              setSpecialite('');
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${isOtherSpecialite ? 'bg-elite-gold/10 text-elite-gold font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                          >
                            <div className={`p-1.5 rounded-lg ${isOtherSpecialite ? 'bg-elite-gold/20' : 'bg-slate-100'}`}>
                              <ListPlus size={16} className={isOtherSpecialite ? 'text-elite-gold' : 'text-slate-400'} />
                            </div>
                            Autre (préciser un nouveau domaine)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isOtherSpecialite && (
                    <div className="relative group animate-in fade-in slide-in-from-top-2">
                      <ListPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-gold transition-colors" size={18} />
                      <input 
                        type="text"
                        required={role === 'PRESTATAIRE' && isOtherSpecialite}
                        value={specialite}
                        onChange={(e) => setSpecialite(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-elite-gold font-bold text-slate-700 text-sm outline-none placeholder:text-slate-300" 
                        placeholder="Veuillez préciser votre domaine..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 h-5 w-5 text-elite-emerald focus:ring-elite-emerald border-none rounded-lg bg-slate-100" />
              <label className="ml-4 text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Je consens aux <a href="#" className="text-elite-emerald hover:text-elite-gold transition-colors">Normes d'Excellence</a> et à la <a href="#" className="text-elite-emerald hover:text-elite-gold transition-colors">Chartre de Confidentialité</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
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
          </form>
        </div>

        <p className="mt-10 text-center text-slate-500 font-bold text-sm">
          Déjà membre du cercle ?{' '}
          <Link to="/login" className="text-elite-emerald hover:text-elite-gold transition-colors decoration-2 underline-offset-8 underline decoration-elite-gold/30">
            Identifiez-vous ici
          </Link>
        </p>

        <div className="mt-12 flex items-center justify-center gap-3 text-slate-400 text-[10px] bg-white/50 backdrop-blur-md border border-white py-4 rounded-full shadow-sm font-black uppercase tracking-widest">
          <Shield size={16} className="text-elite-gold" />
          <span>Protection des Données Personnelles Certifiée</span>
        </div>
      </div>
    </div>
  );
};

export default Register;

