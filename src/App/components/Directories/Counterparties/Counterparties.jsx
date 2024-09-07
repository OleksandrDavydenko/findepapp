// src/components/Directories/Counterparties/Counterparties.js

import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import CounterpartyCard from './CounterpartyCard'; // Імпортуємо компонент "Картка контрагента"
import '../../Lists/lists.css'; // Спільні стилі для сторінки контрагентів

const Counterparties = ({ goBack }) => {
  const [selectedCounterparty, setSelectedCounterparty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [counterparties, setCounterparties] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
      const counterpartyDoc = doc(db, 'counterparties', selectedCounterparty.id);
      await updateDoc(counterpartyDoc, {
        number: newCounterparty.number,
        name: newCounterparty.name,
        code: newCounterparty.code,
        residentStatus: newCounterparty.residentStatus,
        comment: newCounterparty.comment,
      });

      setCounterparties(prevCounterparties =>
        prevCounterparties.map(c =>
          c.id === selectedCounterparty.id ? { ...c, ...newCounterparty } : c
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'counterparties'), {
        number: newCounterparty.number,  // Додаємо номер при створенні
        name: newCounterparty.name,
        code: newCounterparty.code,
        residentStatus: newCounterparty.residentStatus,
        comment: newCounterparty.comment,
      });
      setCounterparties([...counterparties, { id: docRef.id, ...newCounterparty }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (counterparty) => {
    setSelectedCounterparty(counterparty);
  };

  const handleRowDoubleClick = (counterparty) => {
    setSelectedCounterparty(counterparty);
    setIsAdding(true);
  };

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
    <div className="list-container">
      <h2>Контрагенти</h2>
      <button onClick={goBack} className="back-button">Назад</button> {/* Додаємо кнопку "Назад" */}
      <input
        type="text"
        placeholder="Пошук по назві..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedCounterparty}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedCounterparty}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Номер {sortConfig.key === 'number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('name')}>Назва {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('code')}>Код ЄДРПОУ {sortConfig.key === 'code' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('residentStatus')}>Резидент {sortConfig.key === 'residentStatus' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('comment')}>Коментар {sortConfig.key === 'comment' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCounterparties.map((counterparty) => (
              <tr
                key={counterparty.id}
                className={selectedCounterparty && selectedCounterparty.id === counterparty.id ? 'selected' : ''}
                onClick={() => handleRowClick(counterparty)}
                onDoubleClick={() => handleRowDoubleClick(counterparty)}
              >
                <td>{counterparty.number}</td>
                <td>{counterparty.name}</td>
                <td>{counterparty.code}</td>
                <td>{counterparty.residentStatus}</td>
                <td>{counterparty.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Counterparties;
