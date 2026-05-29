import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cr_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  function persist(token, user) {
    localStorage.setItem('cr_token', token);
    localStorage.setItem('cr_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { token, user } = await api.login({ email, password });
    persist(token, user);
    return user;
  }

  async function register(fullName, email, password) {
    const { token, user } = await api.register({ fullName, email, password });
    persist(token, user);
    return user;
  }

  function logout() {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
