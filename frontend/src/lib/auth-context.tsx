import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, translations } from './mock-data';
import { api } from './api';

interface AuthContextType {
  user: any | null;
  language: 'en' | 'rw';
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isLoading: boolean;
  isCheckingAuth: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [language, setLanguage] = useState<'en' | 'rw'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await api.auth.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const userData = await api.auth.login(credentials);
      setUser(userData);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const userData = await api.auth.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'rw' : 'en'));

  const t = (key: string) => translations[language]?.[key] ?? key;

  return (
    <AuthContext.Provider value={{ user, language, login, logout, toggleLanguage, t, isLoading, isCheckingAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
