import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Імпортуємо Firestore
import PaymentCard from './PaymentCard'; // Компонент для картки платежу
import '../../Lists/lists.css'; // Спільні стилі для сторінки

const Payments = ({ goBack }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });

  useEffect(() => {
    const fetchPayments = async () => {
      const querySnapshot = await getDocs(collection(db, 'payments'));
      const loadedPayments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(loadedPayments);
    };

    fetchPayments();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPayments = [...payments].sort((a, b) => {
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
    setSelectedPayment(null);
  };

  const handleEdit = () => {
    if (selectedPayment) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedPayment) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити платіж ${selectedPayment.number}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, 'payments', selectedPayment.id));
        setPayments(payments.filter(p => p.id !== selectedPayment.id));
        setSelectedPayment(null);
      }
    }
  };

  const handleSave = async (newPayment) => {
    if (selectedPayment) {
      const paymentDoc = doc(db, 'payments', selectedPayment.id);
      await updateDoc(paymentDoc, {
        number: newPayment.number,
        date: newPayment.date,
        direction: newPayment.direction,
        counterparty: newPayment.counterparty,
        wallet: newPayment.wallet, // Зберігаємо гаманець
        amount: newPayment.amount,
        currency: newPayment.currency,
        contractNumber: newPayment.contractNumber,
      });

      setPayments(prevPayments =>
        prevPayments.map(p =>
          p.id === selectedPayment.id ? { ...p, ...newPayment } : p
        )
      );
    } else {
      const docRef = await addDoc(collection(db, 'payments'), {
        number: newPayment.number,
        date: newPayment.date,
        direction: newPayment.direction,
        counterparty: newPayment.counterparty,
        wallet: newPayment.wallet, // Додаємо гаманець при створенні
        amount: newPayment.amount,
        currency: newPayment.currency,
        contractNumber: newPayment.contractNumber,
      });
      setPayments([...payments, { id: docRef.id, ...newPayment }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
  };

  const handleRowDoubleClick = (payment) => {
    setSelectedPayment(payment);
    setIsAdding(true);
  };

  const filteredPayments = sortedPayments.filter(payment =>
    payment.counterparty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <PaymentCard
        payment={selectedPayment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="list-container">
      <h2>Платежі</h2>
      <button onClick={goBack} className="back-button">Назад</button>
      <input
        type="text"
        placeholder="Пошук по контрагенту..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedPayment}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedPayment}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Номер {sortConfig.key === 'number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('date')}>Дата {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('direction')}>Напрямок {sortConfig.key === 'direction' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('counterparty')}>Контрагент {sortConfig.key === 'counterparty' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('wallet')}>Гаманець {sortConfig.key === 'wallet' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th> {/* Додано стовпець для гаманця */}
              <th onClick={() => handleSort('amount')}>Сума {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('currency')}>Валюта {sortConfig.key === 'currency' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('contractNumber')}>Номер угоди {sortConfig.key === 'contractNumber' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr
                key={payment.id}
                className={selectedPayment && selectedPayment.id === payment.id ? 'selected' : ''}
                onClick={() => handleRowClick(payment)}
                onDoubleClick={() => handleRowDoubleClick(payment)}
              >
                <td>{payment.number}</td>
                <td>{payment.date}</td>
                <td>{payment.direction}</td>
                <td>{payment.counterparty}</td>
                <td>{payment.wallet}</td> {/* Відображаємо значення гаманця */}
                <td>{payment.amount}</td>
                <td>{payment.currency}</td>
                <td>{payment.contractNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
