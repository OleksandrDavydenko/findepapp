// src/components/Home/Home.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../AuthContext';
import Documents from '../Documents/Documents';
import Reporting from '../Reporting/Reporting';
import Directories from '../Directories/Directories'; // Імпортуємо новий компонент "Довідники"
import './home.css'; // Додаємо файл стилів для цього компонента

const Home = () => {
  const { currentUser, logout } = useAuth();
  const [selectedComponent, setSelectedComponent] = useState('Issuance');

  useEffect(() => {
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

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Documents':
        return <Documents />;
      case 'Recalculation':
        return <Recalculation />;
      case 'Reporting':
        return <Reporting />;
      case 'Directories': // Додаємо кейс для "Довідники"
        return <Directories />;
      default:
        return <Documents />;
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <span className="user-info"> {currentUser?.email}</span>
          <button onClick={logout} className="logout-button">
            Вийти
          </button>
        </div>
      </header>
      <div className="main-content">
        <nav className="sidebar">
          <ul>
            <li onClick={() => setSelectedComponent('Issuance')}>Документи</li>
            <li onClick={() => setSelectedComponent('Reporting')}>Звітність</li>
            <li onClick={() => setSelectedComponent('Directories')}>Довідники</li> {/* Додаємо пункт "Довідники" */}
          </ul>
        </nav>
        <div className="content">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Home;
