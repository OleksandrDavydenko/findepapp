import React, { useState } from 'react';
import Currencies from './Currencies/Currencies';
import Counterparties from './Counterparties/Counterparties';
import Wallets from './Wallets/Wallets';
import CurrencyRateList from './CurrencyRate/CurrencyRateList'; // Імпортуємо компонент для курсу валют
import './directories.css'; // Підключаємо файл стилів

const Directories = () => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);

  const renderDirectoryContent = () => {
    switch (selectedDirectory) {
      case 'Currencies':
        return <Currencies goBack={() => setSelectedDirectory(null)} />; // Передаємо goBack
      case 'Counterparties':
        return <Counterparties goBack={() => setSelectedDirectory(null)} />;
      case 'Wallets':
        return <Wallets goBack={() => setSelectedDirectory(null)} />;
      case 'CurrencyRates':
        return <CurrencyRateList goBack={() => setSelectedDirectory(null)} />;
      default:
        return (
          <div>
            <h2>Довідники</h2>
            <ul className="directories-list">
              <li onClick={() => setSelectedDirectory('Currencies')}>Валюти</li>
              <li onClick={() => setSelectedDirectory('Counterparties')}>Контрагенти</li>
              <li onClick={() => setSelectedDirectory('Wallets')}>Гаманці</li>
              <li onClick={() => setSelectedDirectory('CurrencyRates')}>Курс Валют</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="directories-container">
      {renderDirectoryContent()}
    </div>
  );
};

export default Directories;
