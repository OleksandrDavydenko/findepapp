// src/Home.js

import React, { useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './home.css' //s


const Home = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Забороняємо повернення на попередню сторінку
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleBackButton = (event) => {
    event.preventDefault();
    window.history.pushState(null, document.title, window.location.href);
  };

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <span>Логін: {currentUser?.email}</span>
          <button onClick={logout} className="logout-button">
            Вийти
          </button>
        </div>
      </header>
      <main>
        <h1>Головна сторінка</h1>
        <p>Вітаємо на головній сторінці!</p>
      </main>
    </div>
  );
};

export default Home;
