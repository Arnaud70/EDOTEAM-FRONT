import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallationBanner = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    const isDismissed = localStorage.getItem('edoteam-install-dismissed');

    // Don't show if already installed or dismissed
    if (isStandalone || isDismissed) {
      return;
    }

    const listener = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as any);
      showBannerTemporarily();
    };

    const appInstalledListener = () => {
      setIsVisible(false);
      setInstallPrompt(null);
      localStorage.removeItem('edoteam-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', listener);
    window.addEventListener('appinstalled', appInstalledListener);

    // Fallback: Show banner on localhost after 2 seconds if not dismissed
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let devTimer: ReturnType<typeof setTimeout> | undefined;
    if (isDev && !installPrompt) {
      devTimer = setTimeout(() => {
        showBannerTemporarily();
      }, 2000);
    }

    return () => {
      if (devTimer) clearTimeout(devTimer);
      if (autoHideTimer) clearTimeout(autoHideTimer);
      window.removeEventListener('beforeinstallprompt', listener);
      window.removeEventListener('appinstalled', appInstalledListener);
    };
  }, [installPrompt, autoHideTimer]);

  const showBannerTemporarily = () => {
    setIsVisible(true);
    
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);
    
    setAutoHideTimer(timer);
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      setIsVisible(false);
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setInstallPrompt(null);
      localStorage.removeItem('edoteam-install-dismissed');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (autoHideTimer) clearTimeout(autoHideTimer);
    localStorage.setItem('edoteam-install-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-elite-emerald/95 backdrop-blur-sm shadow-lg rounded-lg animate-in slide-in-from-bottom-2 duration-300 w-80">
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-1.5">
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <Download size={12} className="text-white" />
          </div>
          <p className="text-white font-bold text-xs truncate">
            Installer EDOTEAM
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-2.5 py-0.5 bg-white text-elite-emerald font-bold rounded text-xs whitespace-nowrap hover:scale-105 transition-all"
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="p-0.5 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex-shrink-0"
            title="Fermer"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallationBanner;
