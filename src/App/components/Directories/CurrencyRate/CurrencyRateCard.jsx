import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './currencyRateCard.css'; // Стилі для курсу валют

const CurrencyRateCard = ({ rate, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (rate) {
      // Якщо ми редагуємо курс валюти, встановлюємо значення полів
      setValue('date', rate.date);
      setValue('currency', rate.currency);
      setValue('nbuRate', rate.nbuRate);
      setValue('mbRate', rate.mbRate);
      setValue('cashRate', rate.cashRate);
    } else {
      // Якщо це новий курс валюти, очищуємо поля
      setValue('date', '');
      setValue('currency', '');
      setValue('nbuRate', '');
      setValue('mbRate', '');
      setValue('cashRate', '');
    }
  }, [rate, setValue]);

  const onSubmit = async (data) => {
    onSave({
      date: data.date,
      currency: data.currency,
      nbuRate: parseFloat(data.nbuRate),
      mbRate: parseFloat(data.mbRate),
      cashRate: parseFloat(data.cashRate),
    });
  };

  return (
    <div className="currency-rate-card-container-unique">
      <h2>Картка курсу валюти</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="currency-rate-form-unique">
        <div className="form-group-unique">
          <label htmlFor="date">Дата</label>
          <input
            id="date"
            type="date"
            {...register('date', { required: 'Дата є обов\'язковою' })}
          />
          {errors.date && <p className="error-unique">{errors.date.message}</p>}
        </div>
        <div className="form-group-unique">
          <label htmlFor="currency">Валюта</label>
          <input
            id="currency"
            type="text"
            {...register('currency', { required: 'Валюта є обов\'язковою' })}
          />
          {errors.currency && <p className="error-unique">{errors.currency.message}</p>}
        </div>
        <div className="form-group-unique">
          <label htmlFor="nbuRate">Курс НБУ</label>
          <input
            id="nbuRate"
            type="number"
            step="0.0001"
            {...register('nbuRate', { required: 'Курс НБУ є обов\'язковим' })}
          />
          {errors.nbuRate && <p className="error-unique">{errors.nbuRate.message}</p>}
        </div>
        <div className="form-group-unique">
          <label htmlFor="mbRate">Курс МБ</label>
          <input
            id="mbRate"
            type="number"
            step="0.0001"
            {...register('mbRate', { required: 'Курс МБ є обов\'язковим' })}
          />
          {errors.mbRate && <p className="error-unique">{errors.mbRate.message}</p>}
        </div>
        <div className="form-group-unique">
          <label htmlFor="cashRate">Курс НАЛ</label>
          <input
            id="cashRate"
            type="number"
            step="0.0001"
            {...register('cashRate', { required: 'Курс НАЛ є обов\'язковим' })}
          />
          {errors.cashRate && <p className="error-unique">{errors.cashRate.message}</p>}
        </div>
        <div className="actions-unique">
          <button type="submit">Зберегти</button>
          <button type="button" onClick={onCancel}>Відмінити</button>
        </div>
      </form>
    </div>
  );
};

export default CurrencyRateCard;
