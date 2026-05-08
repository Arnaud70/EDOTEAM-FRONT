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
    <div className={`flex items-center ${className}`}>
      <img 
        src="/assets/images/logo-elite.png" 
        alt="EDOTEAM Logo" 
        className="h-12 w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
