import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import CurrencyRateCard from './CurrencyRateCard'; // Імпортуємо компонент "Картка курсу валюти"
import '../../Lists/lists.css'; // Стилі для сторінки

const CurrencyRateList = ({ goBack }) => {
  const [selectedRate, setSelectedRate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyRates, setCurrencyRates] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      const querySnapshot = await getDocs(collection(db, 'currencyRates'));
      const loadedCurrencyRates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCurrencyRates(loadedCurrencyRates);
    };

    fetchCurrencyRates();
  }, []);

  // Функція для зміни сортування
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Сортування курсів валют
  const sortedCurrencyRates = [...currencyRates].sort((a, b) => {
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
    setSelectedRate(null);
  };

  const handleEdit = () => {
    if (selectedRate) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRate) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити курс валюти за дату ${selectedRate.date}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'currencyRates', selectedRate.id));
        setCurrencyRates(currencyRates.filter(rate => rate.id !== selectedRate.id));
        setSelectedRate(null);
      }
    }
  };

  const handleSave = async (newRate) => {
    if (selectedRate) {
      const rateDoc = doc(db, 'currencyRates', selectedRate.id);
      await updateDoc(rateDoc, {
        date: newRate.date,
        currency: newRate.currency,
        nbuRate: newRate.nbuRate,
        mbRate: newRate.mbRate,
        cashRate: newRate.cashRate,
      });

      setCurrencyRates(prevRates =>
        prevRates.map(rate =>
          rate.id === selectedRate.id ? { ...rate, ...newRate } : rate
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'currencyRates'), {
        date: newRate.date,
        currency: newRate.currency,
        nbuRate: newRate.nbuRate,
        mbRate: newRate.mbRate,
        cashRate: newRate.cashRate,
      });
      setCurrencyRates([...currencyRates, { id: docRef.id, ...newRate }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (rate) => {
    setSelectedRate(rate); // Вибираємо курс для виділення
  };

  const handleRowDoubleClick = (rate) => {
    setSelectedRate(rate);
    setIsAdding(true); // Перехід до редагування
  };

  // Фільтрація курсів валют
  const filteredCurrencyRates = sortedCurrencyRates.filter(rate =>
    rate.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <CurrencyRateCard
        rate={selectedRate}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="list-container">
      <h2>Курс Валют</h2>
      <button onClick={goBack} className="back-button">Назад</button>
      <input
        type="text"
        placeholder="Пошук по валюті..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedRate}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedRate}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>Дата {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('currency')}>Валюта {sortConfig.key === 'currency' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('nbuRate')}>Курс НБУ {sortConfig.key === 'nbuRate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('mbRate')}>Курс МБ {sortConfig.key === 'mbRate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('cashRate')}>Курс НАЛ {sortConfig.key === 'cashRate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCurrencyRates.map((rate) => (
              <tr
                key={rate.id}
                className={selectedRate && selectedRate.id === rate.id ? 'selected' : ''}
                onClick={() => handleRowClick(rate)} // Виділення рядка при кліку
                onDoubleClick={() => handleRowDoubleClick(rate)} // Подвійний клік для редагування
              >
                <td>{rate.date}</td>
                <td>{rate.currency}</td>
                <td>{rate.nbuRate}</td>
                <td>{rate.mbRate}</td>
                <td>{rate.cashRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyRateList;
