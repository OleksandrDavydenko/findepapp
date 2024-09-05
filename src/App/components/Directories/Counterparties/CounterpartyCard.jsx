// src/components/Directories/CounterpartyCard.js

import React, { useState, useEffect } from 'react';
import './counterpartyCard.css'; // Підключаємо стилі для цього компонента

const CounterpartyCard = ({ counterparty, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [residentStatus, setResidentStatus] = useState('Резидент'); // Поле для випадаючого списку

  useEffect(() => {
    if (counterparty) {
      setName(counterparty.name);
      setCode(counterparty.code);
      setResidentStatus(counterparty.residentStatus || 'Резидент'); // Якщо статус не заданий, за замовчуванням "Резидент"
    }
  }, [counterparty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: counterparty ? counterparty.id : null, name, code, residentStatus });
  };

  return (
    <div className="counterparty-card-container">
      <h2>Картка контрагента</h2>
      <form onSubmit={handleSubmit} className="counterparty-form">
        <div className="form-group">
          <label htmlFor="name">Назва</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="code">Код ЄДРПОУ</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="residentStatus">Резидент</label>
          <select
            id="residentStatus"
            value={residentStatus}
            onChange={(e) => setResidentStatus(e.target.value)}
            required
          >
            <option value="Резидент">Резидент</option>
            <option value="Нерезидент">Нерезидент</option>
          </select>
        </div>
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Відмінити</button>
        </div>
      </form>
    </div>
  );
};

export default CounterpartyCard;
