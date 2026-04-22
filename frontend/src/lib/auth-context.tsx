import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, translations } from './mock-data';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  language: 'en' | 'rw';
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'rw'>('en');
  const [isLoading, setIsLoading] = useState(false);

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
        const userData = await api.users.findOne(user.id);
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const logout = () => setUser(null);

  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'rw' : 'en'));

  const t = (key: string) => translations[language]?.[key] ?? key;

  return (
    <AuthContext.Provider value={{ user, language, login, logout, toggleLanguage, t, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
