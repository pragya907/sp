'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = Cookies.get('token');
    const username = Cookies.get('username');
    
    if (token && username) {
      setUser({ username });
    }
    
    setLoading(false);
  }, []);

  const login = async (token, username) => {
    // Set cookies with expiry of 1 day
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('username', username, { expires: 1 });
    setUser({ username });
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('username');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 