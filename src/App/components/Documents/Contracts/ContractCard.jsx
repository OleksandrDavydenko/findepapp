import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getNextContractNumber } from '../../../services/contractNumeric';
import PaymentCard from '../Payments/PaymentCard';
import CounterpartyModal from '../../Modal/CounterpartyModal';
import './contractCard.css';

const ContractCard = ({ contract, onSave, onCancel }) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [incomingPayments, setIncomingPayments] = useState([]);
  const [outgoingPayments, setOutgoingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(contract?.client || '');

  const contractType = watch('contractType', '');
  const sumReceived = watch('sumReceived', 0);
  const sumTransferred = watch('sumTransferred', 0);
  const commissionGross = watch('commissionGross', 0);
  const commissionNet = watch('commissionNet', 0);
  const commissionNetPercent = watch('commissionNetPercent', 0);
  const commissionGrossPercent = watch('commissionGrossPercent', 0);
  const exchangeRate = watch('exchangeRate', 1);
  const commissionNetFromPayments = watch('netPaymentCommission', 0);
  const commissionGrossFromPayments = watch('grossPaymentCommission', 0);
  const totalNetUSD = watch('totalNetUSD', 0);
  const totalGrossUSD = watch('totalGrossUSD', 0);
  const profit = watch('profit', 0);

  useEffect(() => {
    if (contractType === 'Перерахування') {
      const calculatedSumReceived = parseFloat(sumTransferred) + parseFloat(commissionGross);
      setValue('sumReceived', calculatedSumReceived);
    } else if (contractType === 'Видача') {
      const calculatedSumTransferred = parseFloat(sumReceived) - parseFloat(commissionGross);
      setValue('sumTransferred', calculatedSumTransferred);
    }
  }, [contractType, sumReceived, sumTransferred, commissionGross, setValue]);

  useEffect(() => {
    if (contractType === 'Перерахування' && commissionNetPercent) {
      const calculatedCommissionNet = parseFloat(sumTransferred) * (parseFloat(commissionNetPercent) / 100);
      setValue('commissionNet', calculatedCommissionNet.toFixed(2));
    } else if (contractType === 'Видача' && commissionNetPercent) {
      const calculatedCommissionNet = parseFloat(sumReceived) * (parseFloat(commissionNetPercent) / 100);
      setValue('commissionNet', calculatedCommissionNet.toFixed(2));
    }
  }, [contractType, sumTransferred, sumReceived, commissionNetPercent, setValue]);

  useEffect(() => {
    if (contractType === 'Перерахування' && commissionGrossPercent) {
      const calculatedCommissionGross = parseFloat(sumTransferred) * (parseFloat(commissionGrossPercent) / 100);
      setValue('commissionGross', calculatedCommissionGross.toFixed(2));
    } else if (contractType === 'Видача' && commissionGrossPercent) {
      const calculatedCommissionGross = parseFloat(sumReceived) * (parseFloat(commissionGrossPercent) / 100);
      setValue('commissionGross', calculatedCommissionGross.toFixed(2));
    }
  }, [contractType, sumTransferred, sumReceived, commissionGrossPercent, setValue]);

  const calculateCommissionsFromPayments = (payments) => {
    let totalNetCommission = 0;
    let totalGrossCommission = 0;

    payments.forEach(payment => {
      totalNetCommission += payment.commissionNet || 0;
      totalGrossCommission += payment.commissionGross || 0;
    });

    setValue('netPaymentCommission', totalNetCommission);
    setValue('grossPaymentCommission', totalGrossCommission);
  };

  const fetchPaymentsAndCalculateCommissions = async () => {
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

      setIncomingPayments(loadedIncomingPayments);
      setOutgoingPayments(loadedOutgoingPayments);

      const allPayments = [...loadedIncomingPayments, ...loadedOutgoingPayments];
      calculateCommissionsFromPayments(allPayments);

      setValue('number', contract.number);
      setValue('date', contract.date);
      setValue('contractType', contract.contractType);
      setSelectedClient(contract.client);
    } else {
      const newContractNumber = await getNextContractNumber();
      setValue('number', newContractNumber);
    }
  };

  useEffect(() => {
    fetchPaymentsAndCalculateCommissions();
  }, [contract, setValue]);

  useEffect(() => {
    const totalNet = parseFloat(commissionNet) + parseFloat(commissionNetFromPayments);
    const totalGross = parseFloat(commissionGross) + parseFloat(commissionGrossFromPayments);
    const calculatedProfit = totalGross - totalNet;

    setValue('totalNetUSD', totalNet);
    setValue('totalGrossUSD', totalGross);
    setValue('profit', calculatedProfit);
  }, [commissionNet, commissionNetFromPayments, commissionGross, commissionGrossFromPayments, setValue]);

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
    fetchPaymentsAndCalculateCommissions();
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
        fetchPaymentsAndCalculateCommissions();
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
    <div className="contract-card-container-unique">
      <div className="contract-header-unique">
        <h3>{contract ? 'Редагувати контракт' : 'Новий контракт'}</h3>
        {contract && (
          <span className="contract-number-unique">Номер: {contract.number}</span>
        )}
      </div>
      

      <form onSubmit={handleSubmit(onSubmit)} className="contract-form-unique">
        {/* Номер контракту, дата, клієнт */}
        <div className="form-horizontal-group-unique">
          <div className="form-group-unique">
            <label>Номер:</label>
            <input type="text" {...register('number')} readOnly />
          </div>
          <div className="form-group-unique">
            <label>Дата:</label>
            <input type="date" {...register('date', { required: true })} />
          </div>
          <div className="form-group-unique">
            <label>Клієнт:</label>
            <input type="text" value={selectedClient} readOnly onClick={() => setIsModalOpen(true)} required />
          </div>
        </div>

        {/* Тип контракту, курс */}
        <div className="form-horizontal-group-unique">
          <div className="form-group-unique">
            <label>Тип контракту:</label>
            <select {...register('contractType', { required: true })} defaultValue={contract?.contractType || ''}>
              <option value="" disabled>Оберіть тип контракту</option>
              <option value="Видача">Видача</option>
              <option value="Перерахування">Перерахування</option>
            </select>
          </div>
          <div className="form-group-unique">
            <label>Курс на дату угоди:</label>
            <input type="number" {...register('exchangeRate')} defaultValue={1} />
          </div>
        </div>
        

        {/* Зарахування та перерахування у два ряди */}
        <div className="form-horizontal-group-unique form-group-bordered-unique">
          {/* Ряд 1 */}
          <div className="form-group-unique">
            <label>Зарахування:</label>
            <input
              type="number"
              {...register('sumReceived')}
              defaultValue={0}
              className={contractType === 'Видача' ? 'highlight-input' : ''}
              disabled={contractType === 'Перерахування'}
            />
          </div>
          <div className="form-group-unique">
            <label>Валюта:</label>
            <select {...register('receivedCurrency')} required>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="form-group-unique">
            <label>Комісія Нето (%):</label>
            <input type="number" {...register('commissionNetPercent')} max="100" />
          </div>
          <div className="form-group-unique">
            <label>Комісія Нето:</label>
            <input type="number" {...register('commissionNet')} defaultValue={0} />
          </div>

          {/* Ряд 2 */}
          <div className="form-group-unique">
            <label>Перерахування:</label>
            <input
              type="number"
              {...register('sumTransferred')}
              defaultValue={0}
              className={contractType === 'Перерахування' ? 'highlight-input' : ''}
              disabled={contractType === 'Видача'}
            />
          </div>
          <div className="form-group-unique">
            <label>Валюта:</label>
            <select {...register('transferredCurrency')} required>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="form-group-unique">
            <label>Комісія Бруто (%):</label>
            <input type="number" {...register('commissionGrossPercent')} max="100" />
          </div>
          <div className="form-group-unique">
            <label>Комісія Бруто:</label>
            <input type="number" {...register('commissionGross')} defaultValue={0} />
          </div>
        </div>

        {/* Сума в USD, комісії з платіжок */}
                {/* Інформація в стилі таблиці */}
                <div className="contract-info-table">
          <div className="table-row">
            <div className="table-cell">Зарахування в USD:</div>
            <div className="table-cell">{(sumReceived * exchangeRate).toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Перерахування в USD:</div>
            <div className="table-cell">{(sumTransferred * exchangeRate).toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Комісія Нето з платіжок:</div>
            <div className="table-cell">{commissionNetFromPayments.toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Комісія Бруто з платіжок:</div>
            <div className="table-cell">{commissionGrossFromPayments.toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Загальна сума Нето USD:</div>
            <div className="table-cell">{totalNetUSD.toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Загальна сума Бруто USD:</div>
            <div className="table-cell">{totalGrossUSD.toFixed(2)}</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Прибуток USD:</div>
            <div className="table-cell">{profit.toFixed(2)}</div>
          </div>
        </div>
  
      </form>
      <hr className="divider-unique" />

      <div className="payments-section-unique">
        <div className="payments-left-unique">
          <h4>Вхідні платежі</h4>
          <div className="payment-actions-unique">
            <button onClick={() => handleAddPayment('incoming')}>Додати</button>
            <button onClick={handleEditPayment} disabled={!selectedPayment}>Редагувати</button>
            <button onClick={handleDeletePayment} disabled={!selectedPayment}>Видалити</button>
          </div>
          <table className="payments-table-unique">
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

        <div className="payments-right-unique">
          <h4>Вихідні платежі</h4>
          <div className="payment-actions-unique">
            <button onClick={() => handleAddPayment('outgoing')}>Додати</button>
            <button onClick={handleEditPayment} disabled={!selectedPayment}>Редагувати</button>
            <button onClick={handleDeletePayment} disabled={!selectedPayment}>Видалити</button>
          </div>
          <table className="payments-table-unique">
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
        <div className="actions-unique">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Скасувати</button>
        </div>

      {isModalOpen && (
        <CounterpartyModal onClose={() => setIsModalOpen(false)} onSelect={handleSelectClient} />
      )}
    </div>
  );
};

export default ContractCard;
