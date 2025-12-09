// src/services/firestoreService.ts
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { db } from '../firebase'; 
import { InventoryItem } from '../types/inventory';

// 1. HELPER: Get Current User ID
const getUserId = () => {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error("User not authenticated");
  return auth.currentUser.uid;
};

// 2. HELPER: Get User's Private Collection
const getUserInventoryRef = () => {
  const uid = getUserId();
  // Store data in: users/{uid}/inventory
  return collection(db, 'users', uid, 'inventory'); 
};

// --- CORE FUNCTIONS (PRIVATE) ---

export const subscribeToItems = (callback: (items: InventoryItem[]) => void) => {
  try {
    const ref = getUserInventoryRef();
    return onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as InventoryItem);
      callback(items);
    });
  } catch (e) {
    return () => {};
  }
};

export const addItemCloud = async (item: InventoryItem) => {
  const uid = getUserId();
  const itemRef = doc(db, 'users', uid, 'inventory', item.id);
  await setDoc(itemRef, item);
};

export const updateItemCloud = async (item: InventoryItem) => {
  const uid = getUserId();
  const itemRef = doc(db, 'users', uid, 'inventory', item.id);
  await setDoc(itemRef, item, { merge: true });
};

export const deleteItemCloud = async (id: string) => {
  const uid = getUserId();
  const itemRef = doc(db, 'users', uid, 'inventory', id);
  await deleteDoc(itemRef);
};

export const fetchItemsOnce = async () => {
  try {
    const ref = getUserInventoryRef();
    const snap = await getDocs(ref);
    return snap.docs.map(doc => doc.data() as InventoryItem);
  } catch (e) {
    return [];
  }
};

export const migrateLocalToCloud = async (localItems: InventoryItem[]) => {
  const uid = getUserId();
  const batch = writeBatch(db);
  localItems.forEach((item) => {
    const ref = doc(db, 'users', uid, 'inventory', item.id);
    batch.set(ref, item);
  });
  await batch.commit();
};

/**
 * --- SPECIAL MIGRATION FUNCTION ---
 * This copies data from the 'demo-user' folder (your old data) to your new account.
 */
export const importFromDemoUser = async () => {
  const uid = getUserId();
  console.log("Starting migration from demo-user...");

  // 1. Read from the specific folder where your data is
  const oldRef = collection(db, 'users', 'demo-user', 'items');
  const snapshot = await getDocs(oldRef);

  if (snapshot.empty) {
    alert("No data found in the old system.");
    return;
  }

  // 2. Write to your new private folder
  const batch = writeBatch(db);
  let count = 0;

  snapshot.docs.forEach((docSnap) => {
    const newRef = doc(db, 'users', uid, 'inventory', docSnap.id);
    batch.set(newRef, docSnap.data());
    count++;
  });

  await batch.commit();
  alert(`Success! Imported ${count} items from old system.`);
};