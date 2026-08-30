import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fixed?: boolean;
  actions?: React.ReactNode;
}

// Bandeau affiché tant que le profil prestataire n'a pas été validé par l'admin.
const VerificationBanner = () => {
  const { user } = useAuth();

  if (!user || user.role?.toUpperCase() !== 'PRESTATAIRE') return null;

  if (user.verificationStatus === 'PENDING') {
    return (
      <div className="w-full bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 px-6 py-3 flex items-center gap-3 text-sm font-bold">
        <ShieldAlert size={18} className="shrink-0" />
        Votre profil est en cours d'examen par notre équipe. Certaines fonctionnalités restent limitées tant qu'il n'est pas validé.
      </div>
    );
  }

  if (user.verificationStatus === 'REJECTED') {
    return (
      <div className="w-full bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-6 py-3 flex items-center gap-3 text-sm font-bold">
        <ShieldX size={18} className="shrink-0" />
        Votre document justificatif n'a pas été validé{user.rejectionReason ? ` : ${user.rejectionReason}` : '.'} Rendez-vous dans « Compléter mon profil » pour en soumettre un nouveau.
      </div>
    );
  }

  return null;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, fixed = false, actions }) => {
  // "fixed" n'est appliqué qu'à partir de lg : en dessous, MobileDashboardHeader (App.tsx)
  // est déjà fixed top-0 sur toute la largeur — les deux en même temps se superposaient et
  // le hamburger mobile devenait invisible/inclique­table (intercepté par ce header).
  const wrapperClass = fixed
    ? 'relative lg:fixed lg:top-0 left-0 right-0 lg:left-80 bg-white dark:bg-slate-900 lg:z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 px-6 shadow-sm border-b border-slate-100 dark:border-slate-800 transition-colors duration-300'
    : 'flex items-center justify-between mb-12';

  return (
    <>
      <header className={wrapperClass}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-1">
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </motion.div>

      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}
      </header>
      {fixed && <div className="hidden lg:block w-full h-24" />}
      {fixed && <VerificationBanner />}
    </>
  );
};

export default PageHeader;
