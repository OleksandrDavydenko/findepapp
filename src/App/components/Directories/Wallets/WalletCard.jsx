import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './walletCard.css'; // Стилі для гаманців
import { getNextWalletNumber } from '../../../services/walletsNumeric'; // Імпорт функції для гаманців

const WalletCard = ({ wallet, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (wallet) {
      // Якщо ми редагуємо гаманець, встановлюємо значення полів
      setValue('number', wallet.number);
      setValue('name', wallet.name);
      setValue('type', wallet.type);
    } else {
      // Якщо це новий гаманець, очищуємо поля
      setValue('number', '');
      setValue('name', '');
      setValue('type', 'нал');
    }
  }, [wallet, setValue]);

  const onSubmit = async (data) => {
    let number = getValues('number');
    
    // Генеруємо новий номер, якщо це новий гаманець
    if (!number) {
      number = await getNextWalletNumber(); // Генерація номера для гаманця
    }

    // Викликаємо функцію onSave з новими даними гаманця
    onSave({
      number, // Встановлюємо згенерований або наявний номер
      name: data.name,
      type: data.type,
    });
  };

  return (
    <div className="wallet-card-container">
      <h2>Картка гаманця</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="wallet-form">
        <div className="form-group">
          <label htmlFor="number">Номер</label>
          <input
            id="number"
            type="text"
            {...register('number')}
            readOnly
            className="number-input" // Стилізуємо як сіре поле
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Назва</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Назва є обов\'язковою' })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="type">Тип</label>
          <select
            id="type"
            {...register('type', { required: 'Тип гаманця є обов\'язковим' })}
          >
            <option value="нал">Нал</option>
            <option value="безнал">Безнал</option>
          </select>
          {errors.type && <p className="error">{errors.type.message}</p>}
        </div>
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Відмінити</button>
        </div>
      </form>
    </div>
  );
};

export default WalletCard;
