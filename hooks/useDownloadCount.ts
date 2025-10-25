import { useState, useCallback } from 'react';

const DOWNLOADS_KEY = 'raff-elkalimat-downloads';

// Helper to get downloads from localStorage
const getStoredDownloads = (): Map<string, number> => {
  try {
    const item = window.localStorage.getItem(DOWNLOADS_KEY);
    if (item) {
      // The stored item is an array of [key, value] pairs
      return new Map(JSON.parse(item));
    }
  } catch (error) {
    console.error("Error reading download counts from localStorage", error);
  }
  return new Map();
};

// Helper to set downloads in localStorage
const setStoredDownloads = (downloads: Map<string, number>) => {
  try {
    // Convert Map to array of [key, value] pairs for JSON serialization
    window.localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(Array.from(downloads.entries())));
  } catch (error) {
    console.error("Error writing download counts to localStorage", error);
  }
};


export const useDownloadCount = () => {
  const [downloads, setDownloads] = useState<Map<string, number>>(getStoredDownloads);

  const incrementDownloadCount = useCallback((bookKey: string) => {
    setDownloads(prevDownloads => {
      const newDownloads = new Map(prevDownloads);
      const currentCount = newDownloads.get(bookKey) || 0;
      newDownloads.set(bookKey, currentCount + 1);
      setStoredDownloads(newDownloads);
      return newDownloads;
    });
  }, []);

  const getDownloadCount = useCallback((bookKey: string): number => {
    return downloads.get(bookKey) || 0;
  }, [downloads]);

  return { incrementDownloadCount, getDownloadCount };
};
