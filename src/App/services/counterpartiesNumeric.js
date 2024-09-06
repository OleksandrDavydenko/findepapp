// src/firebase.js або src/services/firestoreService.js
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ваш конфіг Firestore

// Функція для отримання наступного номера контрагента
export const getNextCounterpartyNumber = async () => {
  const counterRef = doc(db, 'metadata', 'counterpartyCounter'); // Документ для зберігання лічильника
  const counterSnap = await getDoc(counterRef);

  if (counterSnap.exists()) {
    let currentNumber = counterSnap.data().currentNumber;

    // Збільшуємо лічильник на 1
    await updateDoc(counterRef, {
      currentNumber: currentNumber + 1
    });

    return currentNumber + 1;
  } else {
    // Якщо лічильник ще не існує, ініціалізуємо його значенням 1
    await setDoc(counterRef, { currentNumber: 1 });
    return 1;
  }
};
