import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

// Створення контексту
const AuthContext = createContext();

// Провайдер контексту автентифікації
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Перевірка стану автентифікації
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/');
      }
    });

    // Чистимо підписку при розмонтуванні
    return () => unsubscribe();
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
