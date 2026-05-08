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
  titreProfessionnel?: string;
  bio?: string;
  localisation?: string;
  telephone?: string;
  media?: Media[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
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

      if (token) {
        localStorage.setItem('access_token', token);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        try {
          const userData = await authService.getProfile();
          setUser(userData);
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

  const login = async (credentials: any) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
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
