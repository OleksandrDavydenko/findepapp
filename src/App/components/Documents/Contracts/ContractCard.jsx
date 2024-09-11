import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Firestore config
import { getNextContractNumber } from '../../../services/contractNumeric'; // Number generation
import PaymentCard from '../Payments/PaymentCard'; // Імпорт компонента PaymentCard
import CounterpartyModal from '../../Modal/CounterpartyModal'; // Modal for selecting a counterparty
import './contractCard.css'; // Styles

const ContractCard = ({ contract, onSave, onCancel }) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [incomingPayments, setIncomingPayments] = useState([]);
  const [outgoingPayments, setOutgoingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false); // Стан для додавання/редагування платежу
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for client selection
  const [selectedClient, setSelectedClient] = useState(contract?.client || '');
  const [calculatingDirection, setCalculatingDirection] = useState(null); // Для контролю напрямку розрахунків

  const contractType = watch('contractType', '');
  const sumReceived = watch('sumReceived', 0); // Сума зараховано
  const sumTransferred = watch('sumTransferred', 0); // Сума перераховано
  const commissionGross = watch('commissionGross', 0); // Комісія бруто
  const commissionNet = watch('commissionNet', 0); // Комісія нето
  const profit = watch('profit', 0); // Прибуток

  // Динамічні обчислення
  useEffect(() => {
    if (contractType === 'Видача' && calculatingDirection !== 'sumReceived' && sumReceived > 0 && commissionGross >= 0) {
      setCalculatingDirection('sumReceived');
      const newSumTransferred = sumReceived - commissionGross;
      if (newSumTransferred !== sumTransferred) {
        setValue('sumTransferred', newSumTransferred);
      }
    }
  }, [sumReceived, commissionGross, setValue, calculatingDirection, sumTransferred, contractType]);

  useEffect(() => {
    if (contractType === 'Перерахування' && calculatingDirection !== 'sumTransferred' && sumTransferred > 0 && commissionGross >= 0) {
      setCalculatingDirection('sumTransferred');
      const newSumReceived = parseFloat(sumTransferred) + parseFloat(commissionGross);
      if (newSumReceived !== sumReceived) {
        setValue('sumReceived', newSumReceived);
      }
    }
  }, [sumTransferred, commissionGross, setValue, calculatingDirection, sumReceived, contractType]);

  useEffect(() => {
    // Після кожного перерахунку обнуляємо напрямок для запобігання циклам
    if (calculatingDirection) {
      setTimeout(() => setCalculatingDirection(null), 0);
    }
  }, [calculatingDirection]);

  useEffect(() => {
    if (commissionGross >= 0 && commissionNet >= 0) {
      setValue('profit', commissionGross - commissionNet);
    }
  }, [commissionGross, commissionNet, setValue]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (contract) {
        const contractNumber = contract.number;

        const incomingQuery = query(
          collection(db, 'payments'),
          where('contractNumber', '==', contractNumber),
          where('direction', '==', 'incoming')
        );
        const incomingSnapshot = await getDocs(incomingQuery);
        const loadedIncomingPayments = incomingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIncomingPayments(loadedIncomingPayments);

        const outgoingQuery = query(
          collection(db, 'payments'),
          where('contractNumber', '==', contractNumber),
          where('direction', '==', 'outgoing')
        );
        const outgoingSnapshot = await getDocs(outgoingQuery);
        const loadedOutgoingPayments = outgoingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOutgoingPayments(loadedOutgoingPayments);

        setValue('number', contract.number);
        setValue('date', contract.date);
        setValue('contractType', contract.contractType);
        setSelectedClient(contract.client);
      } else {
        const newContractNumber = await getNextContractNumber();
        setValue('number', newContractNumber);
      }
    };

    fetchPayments();
  }, [contract, setValue]);

  const handleSavePayment = async (newPayment) => {
    if (selectedPayment) {
      const paymentDoc = doc(db, 'payments', selectedPayment.id);
      await updateDoc(paymentDoc, newPayment);

      if (newPayment.direction === 'incoming') {
        setIncomingPayments(prevPayments =>
          prevPayments.map(p => (p.id === selectedPayment.id ? { ...p, ...newPayment } : p))
        );
      } else {
        setOutgoingPayments(prevPayments =>
          prevPayments.map(p => (p.id === selectedPayment.id ? { ...p, ...newPayment } : p))
        );
      }
    } else {
      const newPaymentDoc = await addDoc(collection(db, 'payments'), {
        ...newPayment,
        contractNumber: contract.number,
      });
      const savedPayment = { id: newPaymentDoc.id, ...newPayment };

      if (newPayment.direction === 'incoming') {
        setIncomingPayments(prev => [...prev, savedPayment]);
      } else {
        setOutgoingPayments(prev => [...prev, savedPayment]);
      }
    }

    setIsAddingPayment(false);
    setSelectedPayment(null);
  };

  const handleAddPayment = (direction) => {
    setSelectedPayment(null);
    setIsAddingPayment(true);
  };

  const handleEditPayment = () => {
    if (selectedPayment) {
      setIsAddingPayment(true);
    }
  };

  const handleDeletePayment = async () => {
    if (selectedPayment) {
      const isConfirmed = window.confirm('Ви впевнені, що хочете видалити платіж?');
      if (isConfirmed) {
        await deleteDoc(doc(db, 'payments', selectedPayment.id));
        if (selectedPayment.direction === 'incoming') {
          setIncomingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
        } else {
          setOutgoingPayments(prev => prev.filter(p => п.id !== selectedPayment.id));
        }
        setSelectedPayment(null);
      }
    }
  };

  const handleRowDoubleClick = (payment) => {
    setSelectedPayment(payment);
    setIsAddingPayment(true);
  };

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
  };

  const onSubmit = (data) => {
    onSave({
      ...data,
      client: selectedClient,
    });
  };

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
      <div className="contract-header">
        <h3>{contract ? 'Редагувати контракт' : 'Новий контракт'}</h3>
        {contract && (
          <span className="contract-number">Номер: {contract.number}</span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="contract-form">
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Номер:</label>
            <input type="text" {...register('number')} readOnly />
          </div>
          <div className="form-group">
            <label>Дата:</label>
            <input type="date" {...register('date', { required: true })} />
          </div>
        </div>
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Клієнт:</label>
            <input type="text" value={selectedClient} readOnly onClick={() => setIsModalOpen(true)} required />
          </div>
          <div className="form-group">
            <label>Вид контракту:</label>
            <select {...register('contractType', { required: true })} defaultValue={contract?.contractType || ''} required>
              <option value="" disabled>Оберіть тип контракту</option>
              <option value="Видача">Видача</option>
              <option value="Перерахування">Перерахування</option>
            </select>
          </div>
        </div>

        <div className="form-horizontal-group additional-requisites">
          <div className={`form-group ${contractType === 'Видача' ? 'highlighted' : ''}`}>
            <label>Сума зараховано:</label>
            <input type="number" {...register('sumReceived')} defaultValue={0} disabled={contractType === 'Перерахування'} />
          </div>
          <div className="form-group">
            <label>Комісія нето:</label>
            <input type="number" {...register('commissionNet')} defaultValue={0} />
          </div>
          <div className="form-group">
            <label>Комісія бруто:</label>
            <input type="number" {...register('commissionGross')} defaultValue={0} />
          </div>
          <div className={`form-group ${contractType === 'Перерахування' ? 'highlighted' : ''}`}>
            <label>Сума перераховано:</label>
            <input type="number" {...register('sumTransferred')} defaultValue={0} disabled={contractType === 'Видача'} />
          </div>
          <div className="form-group">
            <label>Прибуток:</label>
            <input type="number" {...register('profit')} readOnly defaultValue={0} />
          </div>
        </div>

        <hr className="divider" />
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Скасувати</button>
        </div>
      </form>

      <div className="payments-section">
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
                  <td>{payment.wallet}</td>
                  <td>{payment.currency}</td>
                  <td>{payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  <td>{payment.wallet}</td>
                  <td>{payment.currency}</td>
                  <td>{payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CounterpartyModal onClose={() => setIsModalOpen(false)} onSelect={handleSelectClient} />
      )}
    </div>
  );
};

export default ContractCard;
