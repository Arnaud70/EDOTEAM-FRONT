import { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Briefcase, ArrowRight, CheckCircle2, Shield, Zap, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        motDePasse: password,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMsg = err.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
      setError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
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
                  <input type="tel" className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 outline-none placeholder:text-slate-300" placeholder="+228 90 00 00 00" />
                </div>
              </div>
            </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-gold transition-colors" size={18} />
                    <select className="w-full pl-14 pr-5 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-elite-gold appearance-none font-bold text-slate-700 text-sm outline-none">
                      <option>Région d'Expertise</option>
                      <option>Lomé & Environs</option>
                      <option>Kara - Maritime</option>
                    </select>
                  </div>
                  <div className="relative group">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-elite-gold transition-colors" size={18} />
                    <select className="w-full pl-14 pr-5 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-elite-gold appearance-none font-bold text-slate-700 text-sm outline-none">
                      <option>Domaine de Spécialité</option>
                      <option>Expert Électricien</option>
                      <option>Plomberie de Luxe</option>
                      <option>Design d'Intérieur</option>
                    </select>
                  </div>
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

