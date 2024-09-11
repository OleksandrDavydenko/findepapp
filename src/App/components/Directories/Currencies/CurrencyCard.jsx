import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './currencyCard.css'; // Стилі для валюти
import { getNextCurrencyNumber } from '../../../services/currencyNumeric'; // Імпорт функції для генерації номера валюти

const CurrencyCard = ({ currency, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (currency) {
      // Якщо ми редагуємо валюту, встановлюємо значення полів
      setValue('number', currency.number);
      setValue('code', currency.code);
      setValue('name', currency.name);
      setValue('shortName', currency.shortName);
    } else {
      // Якщо це нова валюта, очищуємо поля
      setValue('number', '');
      setValue('code', '');
      setValue('name', '');
      setValue('shortName', '');
    }
  }, [currency, setValue]);

  const onSubmit = async (data) => {
    let number = getValues('number');
    
    // Генеруємо новий номер, якщо це нова валюта
    if (!number) {
      number = await getNextCurrencyNumber(); // Генерація номера для валюти
    }

    // Викликаємо функцію onSave з новими даними валюти
    onSave({
      number, // Встановлюємо згенерований або наявний номер
      code: data.code,
      shortName: data.shortName, // Додаємо скорочену назву
      name: data.name, // Повна назва тепер нижче
    });
  };

  return (
    <div className="currency-card-container">
      <h2>Картка валюти</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="currency-form">
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
          <label htmlFor="code">Код валюти</label>
          <input
            id="code"
            type="text"
            {...register('code', { required: 'Код валюти є обов\'язковим' })}
          />
          {errors.code && <p className="error">{errors.code.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="shortName">Скорочена назва</label>
          <input
            id="shortName"
            type="text"
            {...register('shortName', { required: 'Скорочена назва є обов\'язковою' })}
          />
          {errors.shortName && <p className="error">{errors.shortName.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="name">Повна назва</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Повна назва є обов\'язковою' })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>
        <div className="actions">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Відмінити</button>
        </div>
      </form>
    </div>
  );
};

export default CurrencyCard;
