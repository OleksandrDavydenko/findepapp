import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import CurrencyCard from './CurrencyCard'; // Імпортуємо компонент "Картка валюти"
import '../../Lists/lists.css'; // Стилі для сторінки валют

const Currencies = ({ goBack }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  useEffect(() => {
    const fetchCurrencies = async () => {
      const querySnapshot = await getDocs(collection(db, 'currencies'));
      const loadedCurrencies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCurrencies(loadedCurrencies);
    };

    fetchCurrencies();
  }, []);

  // Функція для зміни сортування
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Сортування валют
  const sortedCurrencies = [...currencies].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleAdd = () => {
    setIsAdding(true);
    setSelectedCurrency(null);
  };

  const handleEdit = () => {
    if (selectedCurrency) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedCurrency) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити валюту ${selectedCurrency.name}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'currencies', selectedCurrency.id));
        setCurrencies(currencies.filter(c => c.id !== selectedCurrency.id));
        setSelectedCurrency(null);
      }
    }
  };

  const handleSave = async (newCurrency) => {
    if (selectedCurrency) {
      const currencyDoc = doc(db, 'currencies', selectedCurrency.id);
      await updateDoc(currencyDoc, {
        number: newCurrency.number,
        code: newCurrency.code,
        name: newCurrency.name,
        shortName: newCurrency.shortName, // Додаємо скорочену назву
      });

      setCurrencies(prevCurrencies =>
        prevCurrencies.map(c =>
          c.id === selectedCurrency.id ? { ...c, ...newCurrency } : c
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'currencies'), {
        number: newCurrency.number,  // Додаємо номер при створенні
        code: newCurrency.code,
        name: newCurrency.name,
        shortName: newCurrency.shortName, // Додаємо скорочену назву
      });
      setCurrencies([...currencies, { id: docRef.id, ...newCurrency }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (currency) => {
    setSelectedCurrency(currency); // Вибираємо валюту для виділення
  };

  const handleRowDoubleClick = (currency) => {
    setSelectedCurrency(currency);
    setIsAdding(true); // Перехід до редагування
  };

  // Фільтрація валют
  const filteredCurrencies = sortedCurrencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <CurrencyCard
        currency={selectedCurrency}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="list-container">
      <h2>Валюти</h2>
      <button onClick={goBack} className="back-button">Назад</button>
      <input
        type="text"
        placeholder="Пошук по назві..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions" style={{ justifyContent: 'flex-start' }}>
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedCurrency}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedCurrency}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Номер {sortConfig.key === 'number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('code')}>Код {sortConfig.key === 'code' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('name')}>Назва {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('shortName')}>Скорочена назва {sortConfig.key === 'shortName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCurrencies.map((currency) => (
              <tr
                key={currency.id}
                className={selectedCurrency && selectedCurrency.id === currency.id ? 'selected' : ''}
                onClick={() => handleRowClick(currency)} // Виділення рядка при кліку
                onDoubleClick={() => handleRowDoubleClick(currency)} // Подвійний клік для редагування
              >
                <td>{currency.number}</td>
                <td>{currency.code}</td>
                <td>{currency.name}</td>
                <td>{currency.shortName}</td> {/* Відображаємо скорочену назву */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Currencies;
