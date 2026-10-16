import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYmLuH4SxaW4yNmgF-3udPA8otlmrbGoU",
  authDomain: "vittav2.firebaseapp.com",
  projectId: "vittav2",
  storageBucket: "vittav2.firebasestorage.app",
  messagingSenderId: "961905648869",
  appId: "1:961905648869:web:3fcd34f18cf9e919f4600c",
  measurementId: "G-TYNPGL8BGJ"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;