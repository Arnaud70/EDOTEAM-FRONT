import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';

interface Media {
  id: string;
  url: string;
  type: 'PROFILE' | 'WORK' | 'DOCUMENT';
}

interface User {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  role: 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';
  photoUrl?: string;
  genre?: 'HOMME' | 'FEMME';
  titreProfessionnel?: string;
  bio?: string;
  localisation?: string;
  telephone?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  emailVerified?: boolean;
  media?: Media[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
        authService.logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const onboarding = urlParams.get('onboarding');

      if (token) {
        localStorage.setItem('access_token', token);
        // Nettoyer l'URL pour éviter de garder le token dans la query
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
          const userData = await authService.getProfile();
          setUser(userData);

          if (onboarding === '1') {
            window.location.href = '/complete-profile';
            return;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil après Google Login", error);
          authService.logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        loadUser();
      }
    };

    handleAuthCallback();
  }, []);

  // Renouvelle la session avant l'expiration du token d'accès, notamment
  // lorsque l'utilisateur reste longtemps sur un dashboard.
  useEffect(() => {
    if (!user) return undefined;

    const refreshSession = () => {
      authService.refresh().catch((error) => {
        console.warn('Renouvellement de session différé:', error?.message || error);
      });
    };
    const interval = window.setInterval(refreshSession, 10 * 60 * 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.id]);

  const login = async (credentials: any) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response?.user) {
      setUser(response.user);
    }
    return response;
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await authService.verifyEmail(email, code);
    if (response?.user) {
      setUser(response.user);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login,
      register,
      verifyEmail,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
