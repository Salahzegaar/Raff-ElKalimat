import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import CategoryRow from './CategoryRow';
import { getBooksBySubject } from '../services/openLibraryService';

interface HomeViewProps {
  onSelectBook: (book: Book) => void;
  isFavorite: (bookKey: string) => boolean;
  onToggleFavorite: (book: Book) => void;
}

const CATEGORIES = [
  // Fiction
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Adventure',
  'Young Adult',
  'Classic Literature',
  'Novels',
  'Arabic',
  'Arabic literature',
  'Poetry',
  // Non-fiction
  'History',
  'Biography',
  'Science',
  'Medicine',
  'Engineering',
  'Religion',
  'Islam',
];

const RECOMMENDATION_CATEGORIES = ['Philosophy', 'Psychology', 'Art', 'Travel'];

interface CategoryData {
  books: Book[];
  error: string | null;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelectBook, isFavorite, onToggleFavorite }) => {
  const [categorizedBooks, setCategorizedBooks] = useState<Record<string, CategoryData>>({});
  const [recommendations, setRecommendations] = useState<CategoryData>({ books: [], error: null });
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const seenBookKeys = new Set<string>();

      // Fetch main categories sequentially with a delay
      for (const category of CATEGORIES) {
        try {
          const books = await getBooksBySubject(category);
          const uniqueBooks = books.filter(book => {
            if (seenBookKeys.has(book.key)) return false;
            seenBookKeys.add(book.key);
            return true;
          });

          setCategorizedBooks(prev => ({
            ...prev,
            [category]: { books: uniqueBooks, error: null }
          }));
        } catch (error) {
          console.error(`Failed to fetch books for category: ${category}`, error);
          setCategorizedBooks(prev => ({
            ...prev,
            [category]: { books: [], error: `Failed to load books for ${category}.` }
          }));
        }
        await sleep(400); // Increased delay to pace requests
      }

      // Fetch recommendations sequentially with a delay
      setIsRecommendationsLoading(true);
      const combinedBooks: Book[] = [];
      let hasError = false;

      for (const category of RECOMMENDATION_CATEGORIES) {
          try {
              const books = await getBooksBySubject(category, 20);
              books.forEach(book => {
                  if (!seenBookKeys.has(book.key)) {
                      seenBookKeys.add(book.key);
                      combinedBooks.push(book);
                  }
              });
          } catch (error) {
              console.error(`Failed to fetch recommendations for subject ${category}:`, error);
              hasError = true;
          }
          await sleep(400); // Increased delay
      }
      
      setRecommendations({
          books: combinedBooks.sort(() => Math.random() - 0.5),
          error: hasError && combinedBooks.length === 0 ? "Could not load recommendations." : null,
      });

      setIsRecommendationsLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="animate-fade-in-up space-y-12">
       <div className="text-center p-4 sm:p-6 md:p-10 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Welcome to Raff ElKalimat</h2>
        <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Discover millions of books, authors, and libraries from around the world.</p>
       </div>
      
      {CATEGORIES.map((category) => (
        <CategoryRow
          key={category}
          category={category}
          books={categorizedBooks[category]?.books}
          isLoading={categorizedBooks[category] === undefined}
          error={categorizedBooks[category]?.error}
          onSelectBook={onSelectBook}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      <CategoryRow
        key="recommendations"
        category="Recommended for You"
        books={recommendations.books}
        isLoading={isRecommendationsLoading}
        error={recommendations.error}
        onSelectBook={onSelectBook}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

    </div>
  );
};

export default HomeView;