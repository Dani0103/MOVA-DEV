import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const storage = {
  async set(key, value) {
    const serialized = JSON.stringify(value);

    if (Platform.OS === "web") {
      localStorage.setItem(key, serialized);
    } else {
      await SecureStore.setItemAsync(key, serialized);
    }
  },

  async get(key) {
    try {
      let value;

      if (Platform.OS === "web") {
        value = localStorage.getItem(key);
      } else {
        value = await SecureStore.getItemAsync(key);
      }

      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async remove(key) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
