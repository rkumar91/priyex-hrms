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
  company?: {
    id: number;
    code: string;
    legalName: string;
    brandName?: string;
    logoUrl?: string;
    [key: string]: any;
  };
  employeeId?: string | number;
  roles: string[];
  permissions?: string[];
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cleanDisplayName = (name?: string | null): string => {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed) {
        const clean = cleanDisplayName(parsed.displayName || parsed.fullName || parsed.email);
        parsed.displayName = clean;
        parsed.fullName = clean;
      }
      return parsed;
    } catch {
      return null;
    }
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
          let rawName = res.data.displayName || res.data.fullName || res.data.email;
          let photoUrl = res.data.avatarUrl || res.data.photoUrl;

          // Fetch latest canonical employee profile to guarantee synced name and photo
          try {
            const empRes: any = await api.get('/employees/me');
            if (empRes.success && empRes.data) {
              const empFullName = `${empRes.data.firstName || ''} ${empRes.data.lastName || ''}`.trim();
              if (empFullName) {
                rawName = empFullName;
              }
              if (empRes.data.photoUrl) {
                photoUrl = empRes.data.photoUrl;
              }
            }
          } catch (e) {
            // Non-employee accounts (e.g. system admins) won't have an employee record, safely ignore
          }

          const sanitizedName = cleanDisplayName(rawName);
          const profile: UserProfile = {
            ...res.data,
            fullName: sanitizedName,
            displayName: sanitizedName,
            photoUrl: photoUrl || undefined,
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
      const rawName = rawUser.displayName || rawUser.fullName || rawUser.email;
      const sanitizedName = cleanDisplayName(rawName);
      const activeUser: UserProfile = {
        ...rawUser,
        fullName: sanitizedName,
        displayName: sanitizedName,
      };
      if (rawUser.companyId) {
        localStorage.setItem('priyex_active_company_id', String(rawUser.companyId));
      }
      if (rawUser.company) {
        const companyName = rawUser.company.brandName || rawUser.company.legalName;
        if (companyName) {
          localStorage.setItem('priyex_active_company_name', companyName);
        }
        if (rawUser.company.logoUrl) {
          localStorage.setItem('priyex_active_company_logo', rawUser.company.logoUrl);
        } else {
          localStorage.removeItem('priyex_active_company_logo');
        }
      }
      setUser(activeUser);
      localStorage.setItem('user', JSON.stringify(activeUser));
      return activeUser;
    }
    return null;
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
      localStorage.removeItem('priyex_active_company_id');
      localStorage.removeItem('priyex_active_company_name');
      localStorage.removeItem('priyex_active_company_logo');
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
