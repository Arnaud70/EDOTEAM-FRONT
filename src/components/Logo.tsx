import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark' }) => {
  const isLight = variant === 'light';
  const isGlass = variant === 'glass';
  
  const primaryColor = isLight || isGlass ? '#FFFFFF' : '#064e3b';
  const accentColor = '#d4af37'; // Gold
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/assets/images/logo-main.png" 
        alt="EDOTEAM Logo" 
        className="w-10 h-10 object-contain"
      />
      <span className={`font-heading font-bold text-xl tracking-tight ${isLight || isGlass ? 'text-white' : 'text-[#064e3b]'}`}>
        EDO<span className="text-[#d4af37]">TEAM</span>
      </span>
    </div>
  );
};

export default Logo;
