import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  fullName?: string;
  displayName?: string;
  photoUrl?: string;
  userType?: string;
  companyId?: string | number;
  employeeId?: string | number;
  roles: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Only show full loading screen if there is an active token but no cached user profile yet
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = localStorage.getItem('accessToken');
    const saved = localStorage.getItem('user');
    return Boolean(token && !saved);
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // If no token exists, the user is unauthenticated. Do NOT make an API call to /auth/me.
    // This prevents unwanted 401 errors on the login page and eliminates initialization lag.
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res: any = await api.get('/auth/me');
        if (res.success && res.data) {
          const profile: UserProfile = {
            ...res.data,
            fullName: res.data.displayName || res.data.fullName || res.data.email,
            displayName: res.data.displayName || res.data.fullName || res.data.email,
          };
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      } catch (err) {
        // Not authenticated or token expired
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res: any = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    if (res.success && res.data) {
      const { accessToken, user: userProfile } = res.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      const rawUser = userProfile || res.data;
      const activeUser: UserProfile = {
        ...rawUser,
        fullName: rawUser.displayName || rawUser.fullName || rawUser.email,
        displayName: rawUser.displayName || rawUser.fullName || rawUser.email,
      };
      setUser(activeUser);
      localStorage.setItem('user', JSON.stringify(activeUser));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
