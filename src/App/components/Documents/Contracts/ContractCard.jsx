import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Firestore config
import { getNextContractNumber } from '../../../services/contractNumeric'; // Number generation
import PaymentCard from '../Payments/PaymentCard'; // Імпорт компонента PaymentCard
import CounterpartyModal from '../../Modal/CounterpartyModal'; // Modal for selecting a counterparty
import './contractCard.css'; // Styles

const ContractCard = ({ contract, onSave, onCancel }) => {
  const { register, handleSubmit, setValue } = useForm();
  const [incomingPayments, setIncomingPayments] = useState([]);
  const [outgoingPayments, setOutgoingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null); // Стан для вибраного платежу
  const [isAddingPayment, setIsAddingPayment] = useState(false); // Стан для додавання/редагування платежу
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for client selection
  const [selectedClient, setSelectedClient] = useState(contract?.client || '');

  useEffect(() => {
    const fetchPayments = async () => {
      if (contract) {
        const contractNumber = contract.number;

        // Fetch incoming payments related to the contract by 'contractNumber'
        const incomingQuery = query(
          collection(db, 'payments'),
          where('contractNumber', '==', contractNumber),
          where('direction', '==', 'incoming')
        );
        const incomingSnapshot = await getDocs(incomingQuery);
        const loadedIncomingPayments = incomingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIncomingPayments(loadedIncomingPayments);

        // Fetch outgoing payments related to the contract by 'contractNumber'
        const outgoingQuery = query(
          collection(db, 'payments'),
          where('contractNumber', '==', contractNumber),
          where('direction', '==', 'outgoing')
        );
        const outgoingSnapshot = await getDocs(outgoingQuery);
        const loadedOutgoingPayments = outgoingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOutgoingPayments(loadedOutgoingPayments);

        // Set form values for editing contract
        setValue('number', contract.number);
        setValue('date', contract.date);
        setValue('contractType', contract.contractType);
        setSelectedClient(contract.client);
      } else {
        // Generate new contract number for new contracts
        const newContractNumber = await getNextContractNumber();
        setValue('number', newContractNumber);
      }
    };

    fetchPayments();
  }, [contract, setValue]);

  // Додавання/редагування платежу
  const handleSavePayment = async (newPayment) => {
    if (newPayment.id) {
      // Якщо платіж редагується, оновлюємо існуючий запис
      const paymentDoc = doc(db, 'payments', newPayment.id);
      await updateDoc(paymentDoc, newPayment);
    } else {
      // Якщо це новий платіж, додаємо його до Firestore
      await addDoc(collection(db, 'payments'), {
        ...newPayment,
        contractNumber: contract.number // Зберігаємо номер контракту для нового платежу
      });
    }

    // Оновлюємо локальний стан платежів після збереження
    if (newPayment.direction === 'incoming') {
      setIncomingPayments((prev) => [...prev, newPayment]);
    } else {
      setOutgoingPayments((prev) => [...prev, newPayment]);
    }

    setIsAddingPayment(false);
  };

  // Відкрити форму для додавання нового платежу
  const handleAddPayment = (direction) => {
    setSelectedPayment(null);
    setIsAddingPayment(true);
  };

  // Вибрати платіж для редагування
  const handleEditPayment = () => {
    if (selectedPayment) {
      setIsAddingPayment(true);
    }
  };

  // Видалення платежу
  const handleDeletePayment = async () => {
    if (selectedPayment) {
      const isConfirmed = window.confirm('Ви впевнені, що хочете видалити платіж?');
      if (isConfirmed) {
        await deleteDoc(doc(db, 'payments', selectedPayment.id));
        setIncomingPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
        setOutgoingPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
        setSelectedPayment(null);
      }
    }
  };

  // Обробка подвійного кліку на рядок таблиці для редагування платежу
  const handleRowDoubleClick = (payment) => {
    setSelectedPayment(payment);
    setIsAddingPayment(true);
  };

  // Вибір платежу при кліку
  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
  };

  // Handle form submission
  const onSubmit = (data) => {
    onSave({
      ...data,
      client: selectedClient // Include selected client in the form data
    });
  };

  // Handle client selection from modal
  const handleSelectClient = (client) => {
    setSelectedClient(client.name);
    setIsModalOpen(false);
  };

  if (isAddingPayment) {
    return (
      <PaymentCard
        payment={selectedPayment}
        onSave={handleSavePayment}
        onCancel={() => setIsAddingPayment(false)}
        contractNumber={contract?.number}
      />
    );
  }

  return (
    <div className="contract-card-container">
      <h3>{contract ? 'Редагувати контракт' : 'Новий контракт'}</h3>

      {/* Contract Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="contract-form">
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Номер:</label>
            <input
              type="text"
              {...register('number')}
              readOnly // Contract number is auto-generated and read-only
            />
          </div>
          <div className="form-group">
            <label>Дата:</label>
            <input
              type="date"
              {...register('date', { required: true })}
            />
          </div>
        </div>
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Клієнт:</label>
            <input
              type="text"
              value={selectedClient}
              readOnly
              onClick={() => setIsModalOpen(true)}
              required
            />
          </div>
          <div className="form-group">
            <label>Вид контракту:</label>
            <select
              {...register('contractType', { required: true })}
              defaultValue={contract?.contractType || ''}
              required
            >
              <option value="" disabled>Оберіть тип контракту</option>
              <option value="Видача">Видача</option>
              <option value="Перерахування">Перерахування</option>
            </select>
          </div>
        </div>
        <hr className="divider" /> {/* Горизонтальна лінія для розділення */}
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Скасувати</button>
        </div>
      </form>

      {/* Payments Section */}
      <div className="payments-section">
        {/* Incoming Payments */}
        <div className="payments-left">
          <h4>Вхідні платежі</h4>
          <div className="payment-actions">
            <button onClick={() => handleAddPayment('incoming')}>Додати</button>
            <button onClick={handleEditPayment} disabled={!selectedPayment}>Редагувати</button>
            <button onClick={handleDeletePayment} disabled={!selectedPayment}>Видалити</button>
          </div>
          <table className="payments-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Дата</th>
                <th>Контрагент</th>
                <th>Гаманець</th>
                <th>Валюта</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {incomingPayments.map(payment => (
                <tr
                  key={payment.id}
                  className={selectedPayment && selectedPayment.id === payment.id ? 'selected' : ''}
                  onClick={() => handleRowClick(payment)}
                  onDoubleClick={() => handleRowDoubleClick(payment)}
                >
                  <td>{payment.number}</td>
                  <td>{payment.date}</td>
                  <td>{payment.counterparty}</td>
                  <td>{payment.wallet}</td> {/* Заповнення даними про гаманець */}
                  <td>{payment.currency}</td>
                  <td>{payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Outgoing Payments */}
        <div className="payments-right">
          <h4>Вихідні платежі</h4>
          <div className="payment-actions">
            <button onClick={() => handleAddPayment('outgoing')}>Додати</button>
            <button onClick={handleEditPayment} disabled={!selectedPayment}>Редагувати</button>
            <button onClick={handleDeletePayment} disabled={!selectedPayment}>Видалити</button>
          </div>
          <table className="payments-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Дата</th>
                <th>Контрагент</th>
                <th>Гаманець</th>
                <th>Валюта</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {outgoingPayments.map(payment => (
                <tr
                  key={payment.id}
                  className={selectedPayment && selectedPayment.id === payment.id ? 'selected' : ''}
                  onClick={() => handleRowClick(payment)}
                  onDoubleClick={() => handleRowDoubleClick(payment)}
                >
                  <td>{payment.number}</td>
                  <td>{payment.date}</td>
                  <td>{payment.counterparty}</td>
                  <td>{payment.wallet}</td> {/* Заповнення даними про гаманець */}
                  <td>{payment.currency}</td>
                  <td>{payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for selecting client (counterparty) */}
      {isModalOpen && (
        <CounterpartyModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectClient}
        />
      )}
    </div>
  );
};

export default ContractCard;
