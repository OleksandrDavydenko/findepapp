import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './login.css'

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Виклик функції входу користувача
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/home'); // Переадресація на головну сторінку після успішного входу
    } catch (error) {
      setErrorMessage('Невірний логін або пароль');
    }
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit">Увійти</button>
      </form>
    </div>
  );
};

export default Login;
