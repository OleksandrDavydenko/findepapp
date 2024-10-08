import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Додаємо імпорт Firestore

const firebaseConfig = {
    apiKey: "AIzaSyBcsxkjcW3xvSnTJBMqUrKuZu8tTupIynI",
    authDomain: "findepapp-a6a5b.firebaseapp.com",
    projectId: "findepapp-a6a5b",
    storageBucket: "findepapp-a6a5b.appspot.com",
    messagingSenderId: "29806359980",
    appId: "1:29806359980:web:11d165f78090fd22587609"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Ініціалізуємо Firestore

export { auth, db }; // Одна експортна операція для обох
