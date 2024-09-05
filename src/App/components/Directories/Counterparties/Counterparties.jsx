// src/components/Directories/Counterparties.js

import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import CounterpartyCard from './CounterpartyCard'; // Імпортуємо компонент "Картка контрагента"
import './counterparties.css'; // Підключаємо стилі для даної сторінки

const Counterparties = () => {
  const [selectedCounterparty, setSelectedCounterparty] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Додаємо стан для пошуку
  const [counterparties, setCounterparties] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Завантажуємо контрагентів з Firebase при завантаженні компонента
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

  const handleAdd = () => {
    setIsAdding(true);
    setSelectedCounterparty(null);
  };

  const handleEdit = () => {
    if (selectedCounterparty) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedCounterparty) {
      // Підтвердження видалення контрагента
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити контрагента ${selectedCounterparty.name}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'counterparties', selectedCounterparty.id));
        setCounterparties(counterparties.filter(c => c.id !== selectedCounterparty.id));
        setSelectedCounterparty(null);
      }
    }
  };

  const handleSave = async (newCounterparty) => {
    if (selectedCounterparty) {
      // Оновлюємо контрагента в Firebase
      const counterpartyDoc = doc(db, 'counterparties', selectedCounterparty.id);
      await updateDoc(counterpartyDoc, {
        name: newCounterparty.name,
        code: newCounterparty.code,
        residentStatus: newCounterparty.residentStatus
      });
      setCounterparties(counterparties.map(c => (c.id === newCounterparty.id ? newCounterparty : c)));
    } else {
      // Додаємо нового контрагента до Firebase
      const docRef = await addDoc(collection(db, 'counterparties'), {
        name: newCounterparty.name,
        code: newCounterparty.code,
        residentStatus: newCounterparty.residentStatus
      });
      setCounterparties([...counterparties, { id: docRef.id, ...newCounterparty }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  // Фільтруємо контрагентів за пошуковим запитом
  const filteredCounterparties = counterparties.filter(counterparty =>
    counterparty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <CounterpartyCard
        counterparty={selectedCounterparty}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="counterparties-container">
      <h2>Контрагенти</h2>
      <input
        type="text"
        placeholder="Пошук по назві..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Оновлюємо стан пошуку
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedCounterparty}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedCounterparty}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="counterparties-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Код ЄДРПОУ</th>
            </tr>
          </thead>
          <tbody>
            {filteredCounterparties.map((counterparty) => (
              <tr
                key={counterparty.id}
                className={selectedCounterparty && selectedCounterparty.id === counterparty.id ? 'selected' : ''}
                onClick={() => setSelectedCounterparty(counterparty)}
              >
                <td>{counterparty.name}</td>
                <td>{counterparty.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Counterparties;
