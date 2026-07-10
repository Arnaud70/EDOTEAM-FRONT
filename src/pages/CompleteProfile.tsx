import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Briefcase, ArrowRight, ShieldCheck, ChevronDown, Zap, ListPlus } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'CLIENT' | 'PRESTATAIRE'>(
    user?.role === 'PRESTATAIRE' ? 'PRESTATAIRE' : 'CLIENT'
  );
  const [telephone, setTelephone] = useState(user?.telephone ?? '');
  const [localisation, setLocalisation] = useState(user?.localisation ?? '');
  const [specialite, setSpecialite] = useState(user?.titreProfessionnel ?? '');
  const [isOtherSpecialite, setIsOtherSpecialite] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

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

    setIsLoading(true);
    try {
      const payload: any = {
        role,
        telephone,
        localisation,
      };

      if (role === 'PRESTATAIRE') {
        payload.titreProfessionnel = specialite;
      }

      const response = await api.patch('/users/profile', payload);
      const updatedUser = response.data?.data ?? response.data;
      updateUser(updatedUser);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error completing profile:', err);
      const backendError = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la mise à jour du profil.';
      setError(Array.isArray(backendError) ? backendError[0] : backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 flex flex-col justify-center bg-[#F8FAFC] px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-elite-emerald/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-elite-gold/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center mb-12">
        <div className="flex justify-center mb-8 transform hover:rotate-3 transition-transform duration-500">
          <Logo variant="dark" className="scale-125" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading mb-4">
          Compléter votre profil
        </h2>
        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
          Même page que l'inscription, avec les champs client / prestataire adaptés.
        </p>
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
                  : 'border-slate-50 text-slate-400 hover:border-slate-200'
              }`}
            >
              <User size={28} className={role === 'CLIENT' ? 'text-elite-emerald' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'CLIENT' ? 'text-slate-900' : 'text-slate-400'}`}>
                Particulier Elite
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole('PRESTATAIRE')}
              className={`p-5 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all duration-500 ${
                role === 'PRESTATAIRE'
                  ? 'border-elite-gold bg-elite-gold/5 shadow-xl shadow-elite-gold/10 scale-105'
                  : 'border-slate-50 text-slate-400 hover:border-slate-200'
              }`}
            >
              <Briefcase size={28} className={role === 'PRESTATAIRE' ? 'text-elite-gold' : 'opacity-40'} />
              <span className={`font-black text-xs uppercase tracking-[0.2em] ${role === 'PRESTATAIRE' ? 'text-slate-900' : 'text-slate-400'}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Nom</label>
              <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Prénom</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  readOnly
                  value={user?.nom ?? ''}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold outline-none"
                />
              </div>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  readOnly
                  value={user?.prenom ?? ''}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Identifiant Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    readOnly
                    value={user?.email ?? ''}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Mobile Elite</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Localisation (Région)</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300"
                    placeholder="Lomé, Maritime..."
                  />
                </div>
              </div>
              <div />
            </div>

            {role === 'PRESTATAIRE' && (
              <div className="p-8 bg-elite-gold/5 rounded-[2.5rem] border border-elite-gold/20 space-y-6">
                <h4 className="font-black text-slate-900 flex items-center gap-3 text-xs uppercase tracking-widest">
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
                          className={`px-4 py-2 rounded-2xl border transition-all text-sm font-bold ${specialite === s.nom ? 'bg-elite-gold text-white border-elite-gold' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-elite-emerald hover:text-elite-emerald'}`}
                        >
                          {s.nom}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="relative z-20">
                    <Briefcase className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors text-slate-400 ${isDropdownOpen ? 'text-elite-gold' : ''}`} size={18} />
                    {isDropdownOpen && (
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                    )}
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-14 pr-5 py-4 bg-white border-2 rounded-2xl cursor-pointer font-bold text-sm outline-none transition-all flex justify-between items-center relative z-40 ${
                        isDropdownOpen ? 'border-elite-gold shadow-lg shadow-elite-gold/10' : 'border-transparent text-slate-700 hover:shadow-md'
                      }`}
                    >
                      <span className={specialite || isOtherSpecialite ? 'text-slate-900' : 'text-slate-400 font-normal truncate'}>
                        {isOtherSpecialite ? 'Autre (nouveau domaine)' : specialite || 'Sélectionnez un domaine d expertise'}
                      </span>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-elite-gold' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                          {services.map((s) => (
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
                            Autre (nouveau domaine)
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Chargement...' : 'Terminer l’inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
