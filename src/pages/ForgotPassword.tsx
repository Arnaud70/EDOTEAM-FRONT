import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import Logo from '../components/Logo';
import authService from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.forgotPassword(email.trim());
      const ttl = res.otpExpiresIn ?? 120;
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}&ttl=${ttl}`);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-12 flex flex-col justify-center bg-[#F8FAFC] dark:bg-[#0b1220] px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-10">
          <Logo variant="dark" className="scale-125" />
        </div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-elite-gold/10 flex items-center justify-center text-elite-gold">
          <KeyRound size={30} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">Mot de passe oublié</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
          Saisissez votre email : nous vous enverrons un code à 6 chiffres pour réinitialiser votre mot de passe.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-10 px-8 rounded-[3rem]">
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3">
              <ShieldCheck size={18} className="text-red-400" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-elite-emerald shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Envoyer le code <ArrowRight size={18} className="text-elite-gold" /></>}
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
          <Link to="/login" className="text-elite-emerald hover:text-elite-gold underline underline-offset-8 decoration-elite-gold/30">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
