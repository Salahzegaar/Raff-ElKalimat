import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types';

const FAVORITES_KEY = 'my-book-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Book[]>([]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVORITES_KEY);
      if (item) {
        setFavorites(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading favorites from localStorage", error);
    }
  }, []);

  const updateStoredFavorites = (newFavorites: Book[]) => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error writing favorites to localStorage", error);
    }
  };

  const addFavorite = useCallback((book: Book) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.some(b => b.key === book.key)) {
        return prevFavorites;
      }
      const newFavorites = [...prevFavorites, book];
      updateStoredFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((bookKey: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.filter(b => b.key !== bookKey);
      updateStoredFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((bookKey: string) => {
    return favorites.some(b => b.key === bookKey);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
