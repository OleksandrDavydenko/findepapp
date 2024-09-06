import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import WalletCard from './WalletCard'; // Імпортуємо компонент "Картка гаманця"
import '../../Lists/lists.css'; // Стилі для сторінки гаманців

const Wallets = () => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [wallets, setWallets] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

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

  // Обробник сортування
  const sortedWallets = [...wallets].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setSelectedWallet(null);
  };

  const handleEdit = () => {
    if (selectedWallet) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedWallet) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити гаманець ${selectedWallet.name}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'wallets', selectedWallet.id));
        setWallets(wallets.filter(w => w.id !== selectedWallet.id));
        setSelectedWallet(null);
      }
    }
  };

  const handleSave = async (newWallet) => {
    if (selectedWallet) {
      const walletDoc = doc(db, 'wallets', selectedWallet.id);
      await updateDoc(walletDoc, {
        number: newWallet.number,
        name: newWallet.name,
        type: newWallet.type,
      });

      setWallets(prevWallets =>
        prevWallets.map(w =>
          w.id === selectedWallet.id ? { ...w, ...newWallet } : w
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'wallets'), {
        number: newWallet.number,  // Додаємо номер при створенні
        name: newWallet.name,
        type: newWallet.type,
      });
      setWallets([...wallets, { id: docRef.id, ...newWallet }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (wallet) => {
    setSelectedWallet(wallet); // Вибираємо гаманець для виділення
  };

  const handleRowDoubleClick = (wallet) => {
    setSelectedWallet(wallet);
    setIsAdding(true); // Перехід до редагування
  };

  const filteredWallets = sortedWallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <WalletCard
        wallet={selectedWallet}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="list-container">
      <h2>Гаманці</h2>
      <input
        type="text"
        placeholder="Пошук по назві..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedWallet}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedWallet}>Видалити</button>
      </div>
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
            {filteredWallets.map((wallet) => (
              <tr
                key={wallet.id}
                className={selectedWallet && selectedWallet.id === wallet.id ? 'selected' : ''}
                onClick={() => handleRowClick(wallet)} // Виділення рядка при кліку
                onDoubleClick={() => handleRowDoubleClick(wallet)} // Подвійний клік для редагування
              >
                <td>{wallet.number}</td>
                <td>{wallet.name}</td>
                <td>{wallet.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Wallets;
