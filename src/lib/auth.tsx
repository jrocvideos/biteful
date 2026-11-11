import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'https://api.boufet.com';

interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// True when a JWT's "exp" time has passed. Non-JWT tokens are treated as valid.
const isTokenExpired = (token: string): boolean => {
  try {
    const part = token.split('.')[1];
    if (!part) return false;
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' && json.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

// Remove everything this site saved in the browser: login, cart, order details.
const clearSavedSession = () => {
  for (const store of [localStorage, sessionStorage]) {
    Object.keys(store)
      .filter(k => /boufet|biteful|cart|basket/i.test(k))
      .forEach(k => store.removeItem(k));
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('boufet_token');
    const u = localStorage.getItem('boufet_user');
    if (t && u) {
      if (isTokenExpired(t)) {
        // Expired login: sign out cleanly instead of failing later at checkout
        clearSavedSession();
      } else {
        setToken(t);
        setUser(JSON.parse(u));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('boufet_token', data.token);
    localStorage.setItem('boufet_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (formData: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    localStorage.setItem('boufet_token', data.token);
    localStorage.setItem('boufet_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearSavedSession();
    setToken(null);
    setUser(null);
    // Full reload so the cart and every other in-memory state starts empty
    window.location.assign('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
