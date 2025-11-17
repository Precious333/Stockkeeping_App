// src/storage/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY = 'stockkeeping_inventory';

export const loadData = async (): Promise<string | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw;
  } catch (e) {
    console.warn('Failed to load data', e);
    return null;
  }
};

export const saveData = async (json: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn('Failed to save data', e);
  }
};

export const clearData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear data', e);
  }
};
