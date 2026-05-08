import api from './api';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  role: 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';
  photoUrl?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  motDePasse: string;
}

export interface RegisterDto {
  email: string;
  motDePasse: string;
  nom: string;
  prenom?: string;
  role: 'CLIENT' | 'PRESTATAIRE';
}

class AuthService {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/login', dto);
    const result = response.data.data; // Extraction de data car le backend utilise un ResponseInterceptor
    if (result && result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/register', dto);
    const result = response.data.data; // Extraction de data
    if (result && result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<any>('/auth/profile');
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Error logging out on backend', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  async refresh(): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/refresh');
    const result = response.data.data || response.data;
    if (result && result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentToken();
  }
}

export const authService = new AuthService();
export default authService;
