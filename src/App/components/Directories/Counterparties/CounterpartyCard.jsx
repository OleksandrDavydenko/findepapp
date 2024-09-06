import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './counterpartyCard.css'; // Підключаємо стилі для цього компонента
import { getNextCounterpartyNumber } from '../../../services/counterpartiesNumeric'; // Імпорт функції з Firestore

const CounterpartyCard = ({ counterparty, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (counterparty) {
      // Якщо ми редагуємо контрагента, встановлюємо значення полів
      setValue('number', counterparty.number);
      setValue('name', counterparty.name);
      setValue('code', counterparty.code);
      setValue('residentStatus', counterparty.residentStatus);
      setValue('comment', counterparty.comment);
    } else {
      // Якщо це новий контрагент, очищуємо поля
      setValue('number', '');
      setValue('name', '');
      setValue('code', '');
      setValue('residentStatus', 'Резидент');
      setValue('comment', '');
    }
  }, [counterparty, setValue]);

  const onSubmit = async (data) => {
    // Якщо контрагент новий (немає поля number), генеруємо номер
    let number = getValues('number');
    
    if (!number) {
      number = await getNextCounterpartyNumber(); // Генеруємо новий номер
    }

    // Викликаємо функцію onSave з новими даними контрагента
    onSave({
      number, // Встановлюємо згенерований або наявний номер
      name: data.name,
      code: data.code,
      residentStatus: data.residentStatus,
      comment: data.comment,
    });
  };

  return (
    <div className="counterparty-card-container">
      <h2>Картка контрагента</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="counterparty-form">
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
          <label htmlFor="code">Код ЄДРПОУ</label>
          <input
            id="code"
            type="text"
            {...register('code', { required: 'Код ЄДРПОУ є обов\'язковим' })}
          />
          {errors.code && <p className="error">{errors.code.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="residentStatus">Резидент</label>
          <select
            id="residentStatus"
            {...register('residentStatus', { required: 'Резидент є обов\'язковим' })}
          >
            <option value="Резидент">Резидент</option>
            <option value="Нерезидент">Нерезидент</option>
          </select>
          {errors.residentStatus && <p className="error">{errors.residentStatus.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="comment">Коментар</label>
          <textarea
            id="comment"
            {...register('comment')}
            rows="4"
          />
        </div>
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Відмінити</button>
        </div>
      </form>
    </div>
  );
};

export default CounterpartyCard;
