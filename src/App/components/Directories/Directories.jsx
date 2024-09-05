// src/components/Directories/Directories.js

import React, { useState } from 'react';
import Currencies from './Currencies/Currencies';
import Counterparties from './Counterparties/Counterparties';
import Wallets from './Wallets/Wallets';
import './directories.css'; // Підключаємо файл стилів

const Directories = () => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);

  const renderDirectoryContent = () => {
    switch (selectedDirectory) {
      case 'Currencies':
        return <Currencies />;
      case 'Counterparties':
        return <Counterparties />;
      case 'Wallets':
        return <Wallets />;
      default:
        return (
          <div>
            <h2>Довідники</h2>
            <ul className="directories-list"> {/* Додаємо клас directories-list */}
              <li onClick={() => setSelectedDirectory('Currencies')}>Валюти</li>
              <li onClick={() => setSelectedDirectory('Counterparties')}>Контрагенти</li>
              <li onClick={() => setSelectedDirectory('Wallets')}>Гаманці</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="directories-container">
      {selectedDirectory && (
        <button onClick={() => setSelectedDirectory(null)} className="back-button">
          Назад
        </button>
      )}
      {renderDirectoryContent()}
    </div>
  );
};

export default Directories;
