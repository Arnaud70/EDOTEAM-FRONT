// Règles de validation partagées côté front (miroir du backend).

export const NAME_REGEX = /^\p{L}[\p{L} .'’-]*$/u;
export const PHONE_REGEX = /^\+?[0-9 ()-]{6,20}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export interface PasswordCheck {
  label: string;
  valid: boolean;
}

/** Retourne null si le nom est valide, sinon un message d'erreur. */
export const validateName = (value: string, champ = 'Ce champ'): string | null => {
  const v = value.trim();
  if (v.length < 2) return `${champ} doit contenir au moins 2 caractères.`;
  if (v.length > 50) return `${champ} ne doit pas dépasser 50 caractères.`;
  if (/\d/.test(v)) return `${champ} ne doit pas contenir de chiffres.`;
  if (!NAME_REGEX.test(v)) return `${champ} ne doit pas contenir de caractères spéciaux.`;
  return null;
};

/** Détail règle par règle de la robustesse du mot de passe. */
export const getPasswordChecks = (value: string): PasswordCheck[] => [
  { label: `Au moins ${PASSWORD_MIN_LENGTH} caractères`, valid: value.length >= PASSWORD_MIN_LENGTH },
  { label: 'Une lettre minuscule', valid: /[a-z]/.test(value) },
  { label: 'Une lettre majuscule', valid: /[A-Z]/.test(value) },
  { label: 'Un chiffre', valid: /\d/.test(value) },
  { label: 'Un caractère spécial', valid: /[^A-Za-z0-9]/.test(value) },
];

export const isPasswordStrong = (value: string): boolean =>
  value.length <= PASSWORD_MAX_LENGTH && getPasswordChecks(value).every((c) => c.valid);

/** null si le mot de passe est valide, sinon le premier message d'erreur. */
export const validatePassword = (value: string): string | null => {
  if (value.length > PASSWORD_MAX_LENGTH) return `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères.`;
  const failed = getPasswordChecks(value).find((c) => !c.valid);
  if (failed) return `Mot de passe trop faible : il manque « ${failed.label.toLowerCase()} ».`;
  return null;
};

export const validatePhone = (value: string): string | null => {
  const v = value.trim();
  if (!v) return null; // optionnel
  if (!PHONE_REGEX.test(v)) return 'Le numéro de téléphone n’est pas valide.';
  return null;
};

/** Score 0..4 pour l'indicateur visuel. */
export const passwordStrengthScore = (value: string): number =>
  getPasswordChecks(value).filter((c) => c.valid).length - 1;
