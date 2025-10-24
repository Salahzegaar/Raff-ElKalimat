import { useState, useEffect, useCallback } from 'react';
import { UserReview } from '../types';

const REVIEWS_STORAGE_PREFIX = 'raff-elkalimat-reviews-';

export const useBookReviews = (bookKey: string) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  // Sanitize the key to be a valid localStorage key part
  const storageKey = `${REVIEWS_STORAGE_PREFIX}${bookKey.replace(/[^a-zA-Z0-9-]/g, '')}`;

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        setReviews(JSON.parse(item));
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error reading reviews from localStorage", error);
      setReviews([]);
    }
  }, [storageKey]);

  const addReview = useCallback((text: string) => {
    if (!text.trim()) return;

    const newReview: UserReview = {
      text,
      date: new Date().toISOString(),
    };
    
    setReviews(prevReviews => {
      const updatedReviews = [newReview, ...prevReviews];
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
      } catch (error) {
        console.error("Error writing reviews to localStorage", error);
      }
      return updatedReviews;
    });
  }, [storageKey]);

  return { reviews, addReview };
};
