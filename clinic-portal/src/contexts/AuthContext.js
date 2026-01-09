'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = () => {
    setUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      picture: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
