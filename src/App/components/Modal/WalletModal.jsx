import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Імпортуємо Firestore
import './modal.css'; // Підключаємо спільні стилі модального вікна

const WalletModal = ({ onClose, onSelect }) => {
  const [wallets, setWallets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  useEffect(() => {
    const fetchWallets = async () => {
      const querySnapshot = await getDocs(collection(db, 'wallets'));
      const loadedWallets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWallets(loadedWallets);
    };

    fetchWallets();
  }, []);

  const filteredWallets = wallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.number.toString().includes(searchTerm) ||
    wallet.type.toLowerCase().includes(searchTerm.toLowerCase()) // Пошук за типом (нал/безнал)
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedWallets = [...filteredWallets].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Вибір Гаманця</h2>
        <input
          type="text"
          placeholder="Пошук по назві, номеру або типу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="modal-search-input"
        />
        <div className="table-container">
          <table className="list-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('number')}>Номер {sortConfig.key === 'number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('name')}>Назва {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('type')}>Тип {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sortedWallets.map((wallet) => (
                <tr key={wallet.id} onClick={() => onSelect(wallet)}>
                  <td>{wallet.number}</td>
                  <td>{wallet.name}</td>
                  <td>{wallet.type}</td> {/* Виводимо збережене значення "нал" або "безнал" */}
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

export default WalletModal;
