import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fixed?: boolean;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, fixed = false, actions }) => {
  const wrapperClass = fixed
    ? 'fixed top-0 left-0 right-0 lg:left-80 bg-white z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 px-6 shadow-sm border-b border-slate-100'
    : 'flex items-center justify-between mb-12';

  return (
    <>
      <header className={wrapperClass}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </motion.div>

      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}
      </header>
      {fixed && <div className="w-full h-20 lg:h-24" />}
    </>
  );
};

export default PageHeader;
