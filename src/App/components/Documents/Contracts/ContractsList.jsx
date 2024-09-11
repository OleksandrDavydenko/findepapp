import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import ContractCard from './ContractCard'; // Компонент для картки контракту
import '../../Lists/lists.css'; // Спільні стилі для сторінки

const Contracts = ({ goBack }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contracts, setContracts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  useEffect(() => {
    const fetchContracts = async () => {
      const querySnapshot = await getDocs(collection(db, 'contracts'));
      const loadedContracts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContracts(loadedContracts);
    };

    fetchContracts();
  }, []);

  // Функція для зміни сортування
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Сортуємо контракти відповідно до налаштувань сортування
  const sortedContracts = [...contracts].sort((a, b) => {
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
    setSelectedContract(null);
  };

  const handleEdit = () => {
    if (selectedContract) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedContract) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити контракт ${selectedContract.number}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'contracts', selectedContract.id));
        setContracts(contracts.filter(c => c.id !== selectedContract.id));
        setSelectedContract(null);
      }
    }
  };

  const handleSave = async (newContract) => {
    if (selectedContract) {
      const contractDoc = doc(db, 'contracts', selectedContract.id);
      await updateDoc(contractDoc, {
        number: newContract.number,
        date: newContract.date,
        client: newContract.client,
        contractType: newContract.contractType,
      });

      setContracts(prevContracts =>
        prevContracts.map(c =>
          c.id === selectedContract.id ? { ...c, ...newContract } : c
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'contracts'), {
        number: newContract.number,
        date: newContract.date,
        client: newContract.client,
        contractType: newContract.contractType,
      });
      setContracts([...contracts, { id: docRef.id, ...newContract }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (contract) => {
    setSelectedContract(contract);
  };

  const handleRowDoubleClick = (contract) => {
    setSelectedContract(contract);
    setIsAdding(true);
  };

// Фільтрація контрактів за пошуковим терміном
const filteredContracts = sortedContracts.filter(contract =>
  contract.client?.toLowerCase().includes(searchTerm.toLowerCase())
);


  if (isAdding) {
    return (
      <ContractCard
        contract={selectedContract}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="list-container">
      <h2>Контракти</h2>
      <button onClick={goBack} className="back-button">Назад</button>
      <input
        type="text"
        placeholder="Пошук по клієнту..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedContract}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedContract}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Номер {sortConfig.key === 'number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('date')}>Дата {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('client')}>Клієнт {sortConfig.key === 'client' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('contractType')}>Вид контракту {sortConfig.key === 'contractType' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((contract) => (
              <tr
                key={contract.id}
                className={selectedContract && selectedContract.id === contract.id ? 'selected' : ''}
                onClick={() => handleRowClick(contract)}
                onDoubleClick={() => handleRowDoubleClick(contract)}
              >
                <td>{contract.number}</td>
                <td>{contract.date}</td>
                <td>{contract.client}</td>
                <td>{contract.contractType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contracts;
