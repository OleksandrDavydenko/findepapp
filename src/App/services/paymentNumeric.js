// services/paymentNumeric.js

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const getNextPaymentNumber = async () => {
  const paymentsSnapshot = await getDocs(collection(db, 'payments'));
  const paymentNumbers = paymentsSnapshot.docs.map(doc => parseInt(doc.data().number, 10)).filter(num => !isNaN(num));

  // Якщо немає жодних платежів, повертаємо 1
  if (paymentNumbers.length === 0) {
    return '000001';
  }

  // Знаходимо найбільший номер і додаємо 1
  const maxNumber = Math.max(...paymentNumbers);
  return (maxNumber + 1).toString().padStart(6, '0'); // Додаємо провідні нулі для формату
};
