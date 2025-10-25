import React from 'react';
import { Book } from '../types';
import BookCard from './BookCard';
import { ArrowLeftIcon, BookmarkIcon } from './icons';

interface FavoritesViewProps {
  favoriteBooks: Book[];
  onSelectBook: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
  isFavorite: (bookKey: string) => boolean;
  onBack: () => void;
  onSearchSeries: (seriesName: string) => void;
  onRequestDownload: (book: Book) => void;
  getDownloadCount: (bookKey: string) => number;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favoriteBooks, onSelectBook, onToggleFavorite, isFavorite, onBack, onSearchSeries, onRequestDownload, getDownloadCount }) => {
  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      <button
        onClick={onBack}
        className="mb-8 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full transition-all duration-200 shadow-lg active:scale-95 border border-gray-200 dark:border-gray-700"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Your Favorites</h2>

      {favoriteBooks.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <BookmarkIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Favorites Yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Click the heart icon on any book to add it to your favorites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {favoriteBooks.map((book, index) => (
            <BookCard
              key={book.key}
              book={book}
              onSelect={onSelectBook}
              isFavorite={isFavorite(book.key)}
              onToggleFavorite={onToggleFavorite}
              onSearchSeries={onSearchSeries}
              onRequestDownload={onRequestDownload}
              getDownloadCount={getDownloadCount}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in-up"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
