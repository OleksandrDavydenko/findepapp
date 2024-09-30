import React, { useState, useEffect } from 'react';
import './modal.css'; // Стилі для модального вікна
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Імпортуємо Firestore

const ContractModal = ({ onClose, onSelect }) => {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContracts = async () => {
      const querySnapshot = await getDocs(collection(db, 'contracts'));
      const loadedContracts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        number: doc.data().number || 'N/A', // Default to 'N/A' if missing
        counterparty: doc.data().client || 'Без контрагента', // Default to 'Без контрагента' if missing
        type: doc.data().contractType || 'Невідомий тип', // Default to 'Невідомий тип' if missing
      }));
      setContracts(loadedContracts);
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(contract =>
    contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Вибір Контракту</h2>
        <input
          type="text"
          placeholder="Пошук по номеру, клієнту або типу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="modal-search-input"
        />
        <div className="table-container modal">
          <table className="list-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Клієнт</th>
                <th>Тип</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} onClick={() => onSelect(contract)}>
                  <td>{contract.number}</td>
                  <td>{contract.counterparty}</td>
                  <td>{contract.type}</td>
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

export default ContractModal;
