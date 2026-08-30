import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, ShieldCheck, Loader2, ArrowRight, RefreshCw, Timer } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';

const CODE_LENGTH = 6;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { verifyEmail } = useAuth();
  const email = params.get('email') || '';
  const ttl = Math.max(10, Number(params.get("ttl")) || 120);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number>(() => Date.now() + ttl * 1000);
  const [now, setNow] = useState<number>(Date.now());
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const lastSubmitted = useRef<string>('');

  useEffect(() => {
    if (!email) navigate('/register');
    else inputsRef.current[0]?.focus();
  }, [email, navigate]);

  // Tick chaque seconde pour le décompte.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const expired = secondsLeft === 0;
  const code = digits.join('');

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setDigits((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      clean.split('').forEach((ch, offset) => {
        if (index + offset < CODE_LENGTH) next[index + offset] = ch;
      });
      return next;
    });
    const nextIndex = Math.min(index + clean.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted) setDigits(pasted.padEnd(CODE_LENGTH, ' ').split('').map((c) => c.trim()));
  };

  const submit = async (submittedCode?: string) => {
    const value = submittedCode ?? code;
    if (locked || isLoading) return;
    if (expired) {
      setError('Le code a expiré. Demandez un nouveau code.');
      return;
    }
    if (value.length !== CODE_LENGTH) {
      setError('Saisissez les 6 chiffres du code.');
      return;
    }
    lastSubmitted.current = value;
    setIsLoading(true);
    setError(null);
    try {
      await verifyEmail(email, value);
      // Inscription manuelle = tout est déjà renseigné : on va directement à l'accueil.
      navigate('/');
    } catch (err: any) {
      const status = err?.response?.status;
      const apiCode = err?.response?.data?.error?.code;
      if (status === 429 || apiCode === 'TOO_MANY_ATTEMPTS') {
        setLocked(true);
      }
      setError(getApiErrorMessage(err, 'Code invalide ou expiré.'));
      setDigits(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Validation automatique dès que les 6 chiffres sont saisis.
  useEffect(() => {
    if (
      code.length === CODE_LENGTH &&
      !isLoading &&
      !expired &&
      !locked &&
      lastSubmitted.current !== code
    ) {
      submit(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isLoading, expired, locked]);

  const resend = async () => {
    if (locked) return;
    setError(null);
    setInfo(null);
    try {
      const res = await authService.resendVerification(email);
      const newTtl = Math.max(10, Number((res as any).otpExpiresIn) || ttl);
      setExpiresAt(Date.now() + newTtl * 1000);
      setDigits(Array(CODE_LENGTH).fill(''));
      lastSubmitted.current = '';
      setInfo(res.message || 'Un nouveau code a été envoyé.');
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429 || err?.response?.data?.error?.code === 'TOO_MANY_ATTEMPTS') {
        setLocked(true);
      }
      setError(getApiErrorMessage(err, 'Impossible de renvoyer le code.'));
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-12 flex flex-col justify-center bg-[#F8FAFC] dark:bg-[#0b1220] px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-8 sm:mb-10">
          <Logo variant="dark" className="scale-110 sm:scale-125" />
        </div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-elite-emerald/10 flex items-center justify-center text-elite-emerald">
          <MailCheck size={30} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">Vérifiez votre email</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
          Un code à 6 chiffres a été envoyé à<br />
          <span className="font-black text-slate-800 dark:text-slate-100 break-all">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 sm:py-10 px-6 sm:px-8 rounded-[2.5rem] sm:rounded-[3rem]">
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-start gap-3">
              <ShieldCheck size={18} className="text-red-400 shrink-0" /> {error}
            </div>
          )}
          {info && !error && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              {info}
            </div>
          )}

          {locked ? (
            <div className="text-center py-6">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                Trop de tentatives incorrectes. Pour votre sécurité, la vérification est bloquée
                pendant environ 1&nbsp;heure. Réessayez plus tard.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-xs font-black text-elite-emerald hover:text-elite-gold uppercase tracking-widest"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className={`flex items-center justify-center gap-2 mb-6 text-sm font-black ${expired ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                <Timer size={16} />
                {expired ? 'Code expiré' : <>Code valable encore <span className="tabular-nums">{mmss}</span></>}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-8">
                <div className="flex justify-center gap-1.5 sm:gap-3">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      disabled={expired || isLoading}
                      value={digit}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl outline-none focus:border-elite-emerald focus:bg-white transition-all text-slate-900 dark:text-white disabled:opacity-40"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || expired || code.length !== CODE_LENGTH}
                  className="w-full py-5 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-elite-emerald shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Valider <ArrowRight size={18} className="text-elite-gold" /></>}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={resend}
                  disabled={!expired}
                  className="inline-flex items-center gap-2 text-xs font-black text-elite-emerald hover:text-elite-gold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} />
                  {expired ? 'Renvoyer un nouveau code' : 'Renvoyer (à l’expiration)'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
          Mauvaise adresse ?{' '}
          <Link to="/register" className="text-elite-emerald hover:text-elite-gold underline underline-offset-8 decoration-elite-gold/30">
            Recommencer l'inscription
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
