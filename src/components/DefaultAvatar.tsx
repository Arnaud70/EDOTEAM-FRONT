import React from 'react';
import { User } from 'lucide-react';

interface DefaultAvatarProps {
  photoUrl?: string | null;
  genre?: 'HOMME' | 'FEMME' | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Remplit son conteneur parent (w-full h-full) : soit la photo de profil,
 * soit une icône de personne neutre teintée selon le genre si aucune photo n'est définie.
 */
const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  photoUrl,
  genre,
  alt = 'Photo de profil',
  className = '',
  iconClassName = 'w-1/2 h-1/2',
}) => {
  if (photoUrl) {
    return <img src={photoUrl} alt={alt} className={`w-full h-full object-cover ${className}`} />;
  }

  const palette =
    genre === 'HOMME'
      ? 'bg-sky-50 text-sky-500'
      : genre === 'FEMME'
      ? 'bg-rose-50 text-rose-500'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';

  return (
    <div className={`w-full h-full flex items-center justify-center ${palette} ${className}`}>
      <User className={iconClassName} strokeWidth={2.2} />
    </div>
  );
};

export default DefaultAvatar;
