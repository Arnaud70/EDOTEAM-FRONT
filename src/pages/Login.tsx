import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, motDePasse: password });
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      // Extraire le message d'erreur de la réponse NestJS standard (avec ou sans AllExceptionsFilter)
      const backendError = err.response?.data?.error?.message || err.response?.data?.message;
      const errorMsg = Array.isArray(backendError) ? backendError[0] : (backendError || 'Identifiants invalides ou erreur serveur.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Rediriger vers l'endpoint Google du backend
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col justify-center bg-[#F8FAFC] px-4 relative overflow-hidden">
      {/* Premium Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-elite-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-elite-emerald/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-10 transform hover:scale-105 transition-transform duration-500">
          <Logo variant="dark" className="scale-125" />
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight font-heading">
          L'Espace <span className="gold-accent">Elite</span>
        </h2>
        <p className="mt-4 text-center text-slate-500 font-medium">
          Identifiez-vous pour accéder à votre univers EDOTEAM.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-12 px-10 rounded-[3.5rem] border-elite-emerald/5 transition-all hover:shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <ShieldCheck size={18} className="text-red-400" />
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                Identifiant Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-elite-emerald transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-elite-emerald/10 transition-all text-sm outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Mot de Passe
                </label>
                <a href="#" className="text-[10px] font-black text-elite-emerald hover:text-elite-gold transition-colors uppercase tracking-widest">
                  Oublié ?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-elite-emerald transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-14 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-elite-emerald/10 transition-all text-sm outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-elite-emerald transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-5 w-5 text-elite-emerald focus:ring-elite-emerald border-none rounded-lg bg-slate-100"
              />
              <label htmlFor="remember-me" className="ml-3 block text-xs text-slate-500 font-bold uppercase tracking-wider">
                Rester connecté
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-5 px-6 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-elite-emerald shadow-xl transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-elite-gold" size={20} />
              ) : (
                <>
                  Se Connecter
                  <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform text-elite-gold" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-5 bg-white text-slate-400 font-black uppercase tracking-widest">Social Elite</span>
              </div>
            </div>

            <div className="mt-8">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-4 px-6 border-2 border-slate-50 rounded-2xl bg-white hover:bg-slate-50 transition-all font-black text-slate-700 text-xs uppercase tracking-widest shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-4" alt="Google" />
                Via Google Elite
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-500 font-bold text-sm">
          Nouveau chez EDOTEAM ?{' '}
          <Link to="/register" className="text-elite-emerald hover:text-elite-gold transition-colors decoration-2 underline-offset-8 underline decoration-elite-gold/30">
            Créer un compte prestige
          </Link>
        </p>

        <div className="mt-12 flex items-center justify-center gap-3 text-slate-400 text-[10px] bg-white/50 backdrop-blur-md border border-white py-4 rounded-full shadow-sm font-black uppercase tracking-widest">
          <Shield size={16} className="text-elite-gold" />
          <span>Sécurité Grade Bancaire • Cryptage 256-bit</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

