import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ваш конфіг Firestore

// Функція для отримання наступного номера контракту
export const getNextContractNumber = async () => {
  const contractCounterRef = doc(db, 'metadata', 'contractCounter'); // Документ для зберігання лічильника контрактів
  const contractCounterSnap = await getDoc(contractCounterRef);

  if (contractCounterSnap.exists()) {
    let currentNumber = contractCounterSnap.data().currentNumber;

    // Збільшуємо лічильник на 1
    await updateDoc(contractCounterRef, {
      currentNumber: currentNumber + 1
    });

    return `CO${currentNumber + 1}`; // Додаємо префікс CO
  } else {
    // Якщо лічильник ще не існує, ініціалізуємо його значенням 1
    await setDoc(contractCounterRef, { currentNumber: 1 });
    return 'CO1';
  }
};