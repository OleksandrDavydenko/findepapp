import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getNextPaymentNumber } from '../../../services/paymentNumeric'; // Генерація номера платежу
import ContractModal from '../../Modal/ContractModal'; // Модальне вікно для вибору контракту
import CounterpartyModal from '../../Modal/CounterpartyModal'; // Модальне вікно для вибору контрагента
import WalletModal from '../../Modal/WalletModal'; // Модальне вікно для вибору гаманця
import './paymentCard.css'; // Стилі для картки платежу

const PaymentCard = ({ payment, onSave, onCancel }) => {
  const { register, handleSubmit, setValue } = useForm();
  const [selectedCounterparty, setSelectedCounterparty] = useState(payment?.counterparty || ''); // Стан для контрагента
  const [selectedContract, setSelectedContract] = useState(payment?.contractNumber || ''); // Стан для контракту
  const [selectedWallet, setSelectedWallet] = useState(payment?.wallet || ''); // Стан для гаманця
  const [contractId, setContractId] = useState(payment?.contractId || null); // Стан для збереження ID контракту
  const [isModalOpenCounterparty, setIsModalOpenCounterparty] = useState(false); // Стан для модального вікна контрагента
  const [isModalOpenContract, setIsModalOpenContract] = useState(false); // Стан для модального вікна контракту
  const [isModalOpenWallet, setIsModalOpenWallet] = useState(false); // Стан для модального вікна гаманця

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (payment) {
        // Якщо є редагування платежу, завантажуємо його дані
        setValue('number', payment.number);
        setValue('date', payment.date);
        setValue('direction', payment.direction);
        setValue('amount', payment.amount);
        setValue('currency', payment.currency);
        setValue('commissionGross', payment.commissionGross || 0);
        setValue('commissionNet', payment.commissionNet || 0);
        setContractId(payment.contractId);
        setSelectedContract(payment.contractNumber);
        setSelectedCounterparty(payment.counterparty);
        setSelectedWallet(payment.wallet); // Встановлюємо вибраний гаманець
      } else {
        // Якщо це новий платіж, генеруємо новий номер
        const newPaymentNumber = await getNextPaymentNumber();
        setValue('number', newPaymentNumber);
      }
    };

    fetchPaymentData();
  }, [payment, setValue]);

  // Обробка збереження форми
  const onSubmit = (data) => {
    onSave({
      ...data,
      counterparty: selectedCounterparty, // Додаємо контрагента до даних форми
      contractId: contractId, // Зберігаємо ID контракту
      contractNumber: selectedContract, // Зберігаємо номер контракту
      wallet: selectedWallet, // Зберігаємо вибраний гаманець
      commissionNet: parseFloat(data.commissionNet), // Комісія нето
      commissionGross: parseFloat(data.commissionGross), // Комісія бруто
    });
  };

  // Обробка вибору контрагента з модального вікна
  const handleSelectCounterparty = (counterparty) => {
    setSelectedCounterparty(counterparty.name); // Зберігаємо вибраного контрагента
    setIsModalOpenCounterparty(false); // Закриваємо модальне вікно
  };

  // Обробка вибору контракту з модального вікна
  const handleSelectContract = (contract) => {
    setSelectedContract(contract.number); // Зберігаємо номер контракту
    setContractId(contract.id); // Зберігаємо ID контракту
    setIsModalOpenContract(false); // Закриваємо модальне вікно
  };

  // Обробка вибору гаманця з модального вікна
  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet.name); // Зберігаємо вибраний гаманець
    setIsModalOpenWallet(false); // Закриваємо модальне вікно
  };

  return (
    <div className="payment-card-container">
      <h3>{payment ? 'Редагувати платіж' : 'Новий платіж'}</h3>

      {/* Форма платежу */}
      <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Номер:</label>
            <input
              type="text"
              {...register('number')}
              readOnly // Номер генерується автоматично і не редагується
            />
          </div>
          <div className="form-group">
            <label>Дата:</label>
            <input
              type="date"
              {...register('date', { required: true })} // Поле дати з валідацією
            />
          </div>
        </div>
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Контрагент:</label>
            <input
              type="text"
              value={selectedCounterparty} // Відображаємо вибраного контрагента
              readOnly
              onClick={() => setIsModalOpenCounterparty(true)} // Відкриваємо модальне вікно для вибору контрагента
              required
            />
          </div>
          <div className="form-group">
            <label>Контракт:</label>
            <input
              type="text"
              value={selectedContract} // Відображаємо вибраний контракт
              readOnly
              onClick={() => setIsModalOpenContract(true)} // Відкриваємо модальне вікно для вибору контракту
              required
            />
          </div>
        </div>
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Гаманець:</label>
            <input
              type="text"
              value={selectedWallet} // Відображаємо вибраний гаманець
              readOnly
              onClick={() => setIsModalOpenWallet(true)} // Відкриваємо модальне вікно для вибору гаманця
              required
            />
          </div>
        </div>
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Напрямок:</label>
            <select
              {...register('direction', { required: true })}
              defaultValue={payment?.direction || ''}
            >
              <option value="" disabled>Оберіть напрямок</option>
              <option value="incoming">Вхідний</option>
              <option value="outgoing">Вихідний</option>
            </select>
          </div>
          <div className="form-group">
            <label>Сума:</label>
            <input
              type="number"
              {...register('amount', { required: true })}
            />
          </div>
          <div className="form-group">
            <label>Валюта:</label>
            <input
              type="text"
              {...register('currency', { required: true })}
            />
          </div>
        </div>

        {/* Додаємо поля для Комісія нето і Комісія бруто */}
        <div className="form-horizontal-group">
          <div className="form-group">
            <label>Комісія нето:</label>
            <input
              type="number"
              {...register('commissionNet', { required: true })}
              defaultValue={payment?.commissionNet || 0}
            />
          </div>
          <div className="form-group">
            <label>Комісія бруто:</label>
            <input
              type="number"
              {...register('commissionGross', { required: true })}
              defaultValue={payment?.commissionGross || 0}
            />
          </div>
        </div>

        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Скасувати</button>
        </div>
      </form>

      {/* Модальне вікно для вибору контрагента */}
      {isModalOpenCounterparty && (
        <CounterpartyModal
          onClose={() => setIsModalOpenCounterparty(false)}
          onSelect={handleSelectCounterparty}
        />
      )}

      {/* Модальне вікно для вибору контракту */}
      {isModalOpenContract && (
        <ContractModal
          onClose={() => setIsModalOpenContract(false)}
          onSelect={handleSelectContract}
        />
      )}

      {/* Модальне вікно для вибору гаманця */}
      {isModalOpenWallet && (
        <WalletModal
          onClose={() => setIsModalOpenWallet(false)}
          onSelect={handleSelectWallet}
        />
      )}
    </div>
  );
};

export default PaymentCard;
