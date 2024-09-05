// src/Login.js

import React from 'react';
import { useForm } from 'react-hook-form';
import './login.css';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Логіка для входу користувача, наприклад, запит до сервера
  };

  return (
    <div className="login-container">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'Це поле є обов\'язковим', pattern: /^\S+@\S+$/i })}
          />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            {...register('password', { required: 'Це поле є обов\'язковим', minLength: { value: 6, message: 'Пароль повинен містити мінімум 6 символів' } })}
          />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <button type="submit">Увійти</button>
      </form>
    </div>
  );
};

export default Login;
