// services/currencyNumeric.js

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const getNextCurrencyNumber = async () => {
  const currenciesSnapshot = await getDocs(collection(db, 'currencies'));
  const currencyNumbers = currenciesSnapshot.docs.map(doc => parseInt(doc.data().number, 10)).filter(num => !isNaN(num));

  // Якщо немає жодних валют, повертаємо '000001'
  if (currencyNumbers.length === 0) {
    return '000001';
  }

  // Знаходимо найбільший номер і додаємо 1
  const maxNumber = Math.max(...currencyNumbers);
  return (maxNumber + 1).toString().padStart(6, '0'); // Додаємо провідні нулі для формату
};
