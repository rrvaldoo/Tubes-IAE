import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof window.document !== 'undefined');

const storage = {
  getItem: async (key) => {
    try {
      if (isWeb) return Promise.resolve(window.localStorage.getItem(key));
      return AsyncStorage.getItem(key);
    } catch (e) {
      console.error('storage.getItem error', e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (isWeb) return Promise.resolve(window.localStorage.setItem(key, value));
      return AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('storage.setItem error', e);
    }
  },
  removeItem: async (key) => {
    try {
      if (isWeb) return Promise.resolve(window.localStorage.removeItem(key));
      return AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('storage.removeItem error', e);
    }
  },
};

export default storage;
