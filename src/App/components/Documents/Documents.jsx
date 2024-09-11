import React, { useState } from 'react';
import Contracts from './Contracts/ContractsList'; // Компонент для розділу "Контракти"
import Payments from './Payments/PaymentsList'; // Компонент для розділу "Платежі"
import './documents.css'; // Підключаємо файл стилів

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const renderDocumentContent = () => {
    switch (selectedDocument) {    
      case 'Contracts':
        return <Contracts goBack={() => setSelectedDocument(null)} />;
      case 'Payments':
        return <Payments goBack={() => setSelectedDocument(null)} />;
      default:
        return (
          <div>
            <h2>Документи</h2>
            <ul className="documents-list">
              <li onClick={() => setSelectedDocument('Contracts')}>Контракти</li>
              <li onClick={() => setSelectedDocument('Payments')}>Платежі</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="documents-container">
      {renderDocumentContent()}
    </div>
  );
};

export default Documents;
