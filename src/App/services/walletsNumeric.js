import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ваш конфіг Firestore

// Функція для отримання наступного номера гаманця
export const getNextWalletNumber = async () => {
  const walletCounterRef = doc(db, 'metadata', 'walletCounter'); // Документ для зберігання лічильника
  const walletCounterSnap = await getDoc(walletCounterRef);

  if (walletCounterSnap.exists()) {
    let currentNumber = walletCounterSnap.data().currentNumber;

    // Збільшуємо лічильник на 1
    await updateDoc(walletCounterRef, {
      currentNumber: currentNumber + 1
    });

    return currentNumber + 1;
  } else {
    // Якщо лічильник ще не існує, ініціалізуємо його значенням 1
    await setDoc(walletCounterRef, { currentNumber: 1 });
    return 1;
  }
};
