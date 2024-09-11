import React, { useState, useEffect } from 'react';
import './modal.css'; // Стилі для модального вікна
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Імпортуємо Firestore

const CounterpartyModal = ({ onClose, onSelect }) => {
  const [counterparties, setCounterparties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCounterparties = async () => {
      const querySnapshot = await getDocs(collection(db, 'counterparties'));
      const loadedCounterparties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCounterparties(loadedCounterparties);
    };

    fetchCounterparties();
  }, []);

  const filteredCounterparties = counterparties.filter(counterparty =>
    counterparty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    counterparty.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    counterparty.number.toString().includes(searchTerm)
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Вибір Контрагента</h2>
        <input
          type="text"
          placeholder="Пошук по назві, коду або номеру..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="modal-search-input"
        />
        <div className="table-container">
          <table className="list-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Назва</th>
                <th>Код ЄДРПОУ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCounterparties.map((counterparty) => (
                <tr key={counterparty.id} onClick={() => onSelect(counterparty)}>
                  <td>{counterparty.number}</td>
                  <td>{counterparty.name}</td>
                  <td>{counterparty.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Закрити</button>
        </div>
      </div>
    </div>
  );
};

export default CounterpartyModal;
