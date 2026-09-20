import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, KeyRound, CheckCircle2, RefreshCw, Timer } from 'lucide-react';
import Logo from '../components/Logo';
import authService from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';
import { validatePassword, getPasswordChecks } from '../utils/validation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const ttl = Math.max(10, Number(params.get("ttl")) || 120);
  const [expiresAt, setExpiresAt] = useState<number>(() => Date.now() + ttl * 1000);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const expired = secondsLeft === 0;
  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  const checks = getPasswordChecks(password);

  const verifyCode = async () => {
    setError(null);
    if (expired) {
      setError('Le code a expiré. Cliquez sur « Renvoyer le code ».');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyResetCode(email.trim(), code.trim());
      setStep(2);
    } catch (err: any) {
      if (err?.response?.status === 429 || err?.response?.data?.error?.code === 'TOO_MANY_ATTEMPTS') {
        setError(getApiErrorMessage(err, 'Trop de tentatives. Réessayez plus tard.'));
        setExpiresAt(Date.now());
      } else {
        setError(getApiErrorMessage(err, 'Code invalide ou expiré.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwdError = validatePassword(password);
    if (pwdError) { setError(pwdError); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }

    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim(), code.trim(), password);
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err: any) {
      if (err?.response?.status === 429 || err?.response?.data?.error?.code === 'TOO_MANY_ATTEMPTS') {
        setError(getApiErrorMessage(err, 'Trop de tentatives. Réessayez plus tard.'));
        setExpiresAt(Date.now()); // force l'état "expiré", bloque la saisie
      } else {
        setError(getApiErrorMessage(err, 'Code invalide ou expiré.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    if (!expired || !email.trim()) return;
    setError(null);
    setInfo(null);
    try {
      const res = await authService.forgotPassword(email.trim());
      const newTtl = Math.max(10, Number(res.otpExpiresIn) || ttl);
      setExpiresAt(Date.now() + newTtl * 1000);
      setCode('');
      setInfo('Un nouveau code a été envoyé.');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Impossible de renvoyer le code.'));
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-12 flex flex-col justify-center bg-[#F8FAFC] dark:bg-[#0b1220] px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-10">
          <Logo variant="dark" className="scale-125" />
        </div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-elite-emerald/10 flex items-center justify-center text-elite-emerald">
          <KeyRound size={30} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
          {step === 1 ? 'Vérifier le code' : 'Nouveau mot de passe'}
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
          {step === 1
            ? 'Saisissez le code à 6 chiffres reçu par email pour continuer.'
            : 'Choisissez maintenant un nouveau mot de passe robuste.'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-10 px-8 rounded-[3rem]">
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3">
              <ShieldCheck size={18} className="text-red-400" /> {error}
            </div>
          )}
          {info && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              {info}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); void verifyCode(); }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none"
                  placeholder="votre@email.com"
                />
              </div>
              </div>

              <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Code à 6 chiffres</label>
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${expired ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Timer size={12} />
                  {expired ? 'Expiré' : <span className="tabular-nums">{mmss}</span>}
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={expired}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-black text-slate-900 dark:text-white outline-none tracking-[0.5em] text-center text-xl disabled:opacity-40"
                placeholder="______"
              />
              </div>

              <button
                type="submit"
                disabled={isLoading || expired}
                className="w-full py-5 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-elite-emerald shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Vérifier le code <ArrowRight size={18} className="text-elite-gold" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} /> Code vérifié
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Nouveau mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none"
                  placeholder="••••••••"
                />
              </div>
              </div>

              <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Confirmer</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-elite-emerald/10 font-bold text-slate-900 dark:text-white outline-none"
                  placeholder="••••••••"
                />
              </div>
              </div>

              {password.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 px-1">
                {checks.map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 text-[11px] font-bold ${c.valid ? 'text-elite-emerald' : 'text-slate-400 dark:text-slate-500'}`}>
                    <CheckCircle2 size={13} className={c.valid ? 'opacity-100' : 'opacity-30'} />
                    {c.label}
                  </li>
                ))}
              </ul>
            )}

              <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-elite-emerald shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Réinitialiser <ArrowRight size={18} className="text-elite-gold" /></>}
              </button>
            </form>
          )}

          {step === 1 && <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resend}
              disabled={!expired}
              className="inline-flex items-center gap-2 text-xs font-black text-elite-emerald hover:text-elite-gold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} />
              {expired ? 'Renvoyer le code' : 'Renvoyer (à l’expiration)'}
            </button>
          </div>}
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

export default ResetPassword;
