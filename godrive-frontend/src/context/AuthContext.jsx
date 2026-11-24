import { createContext, useContext, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rac_user')) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem('rac_token', data.token);
    localStorage.setItem('rac_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    setLoading(true);
    try { return saveSession(await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })); }
    finally { setLoading(false); }
  };

  const register = async (details) => {
    setLoading(true);
    try { return saveSession(await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(details) })); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('rac_token');
    localStorage.removeItem('rac_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
