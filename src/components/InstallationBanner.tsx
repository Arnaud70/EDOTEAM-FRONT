import { useEffect, useRef, useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import {
  getDeferredPrompt,
  onPromptChange,
  clearDeferredPrompt,
  isStandalone,
  isIos,
} from '../lib/pwa';

// Durée d'affichage automatique (ms) avant disparition.
const VISIBLE_MS = 7000;

const InstallationBanner = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(!!getDeferredPrompt());
  const [showIosHint, setShowIosHint] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => dismiss(), VISIBLE_MS);
  };

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, 300);
  };

  useEffect(() => {
    // Déjà installée -> jamais de bannière.
    if (isStandalone()) return;

    // Affichage à chaque chargement de page (montage du composant).
    // Pas de persistance : au rafraîchissement, la bannière revient puis repart.
    setVisible(true);
    startHideTimer();

    const off = onPromptChange(() => setHasPrompt(!!getDeferredPrompt()));

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    const prompt = getDeferredPrompt();
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      clearDeferredPrompt();
      setHasPrompt(false);
      if (outcome === 'accepted') dismiss();
      else startHideTimer();
      return;
    }

    if (isIos()) {
      setShowIosHint(true);
      return;
    }
    // Navigateur sans prompt natif : on laisse la bannière, l'utilisateur
    // peut installer via le menu du navigateur.
    startHideTimer();
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none transition-all duration-300 ${
        leaving ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl bg-slate-900 text-white shadow-2xl shadow-black/30 ring-1 ring-white/10">
        {showIosHint ? (
          <div className="p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold">Installer EDOTEAM sur iPhone</p>
              <button onClick={dismiss} className="p-1 -m-1 text-white/60 hover:text-white" aria-label="Fermer">
                <X size={16} />
              </button>
            </div>
            <p className="mt-2 text-white/70 leading-relaxed">
              Touchez <Share size={14} className="inline mx-0.5 -mt-0.5" /> puis
              <span className="inline-flex items-center gap-1 mx-1 font-semibold text-white">
                <Plus size={13} /> Sur l’écran d’accueil
              </span>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Download size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Installer l’application EDOTEAM</p>
              <p className="truncate text-xs text-white/55">Accès rapide depuis votre écran d’accueil</p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black uppercase tracking-wide text-white transition-transform active:scale-95 hover:bg-emerald-400"
            >
              {hasPrompt || isIos() ? 'Installer' : 'Comment ?'}
            </button>
            <button
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallationBanner;
