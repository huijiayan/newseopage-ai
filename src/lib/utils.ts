import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 安全的localStorage访问函数
export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage access error:', error);
      return null;
    }
  }
  return null;
};

export const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage set error:', error);
    }
  }
};

export const removeLocalStorageItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage remove error:', error);
    }
  }
}; 