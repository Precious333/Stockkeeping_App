// src/firebase.ts
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  // ... your existing config ...
  apiKey: 'AIzaSyBG1f9andCwFcX8Ss7dHFQzmRjNDBRJSZA',
  authDomain: 'stockkeeping-e5466.firebaseapp.com',        
  projectId: 'stockkeeping-e5466',
  storageBucket: 'stockkeeping-e5466.firebasestorage.app',
  messagingSenderId: '778787764168',
  appId: '1:778787764168:android:d3365de1cea9f29bd6b2fd', 
};

const app = initializeApp(firebaseConfig);

// --- AUTH PERSISTENCE ---
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

// --- FIRESTORE PERSISTENCE (THE FIX) ---
// This tells Firebase to store data on the phone disk, not just RAM
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, db };