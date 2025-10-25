import React, { useRef } from 'react';
import { Book } from '../types';
import BookCard from './BookCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CategoryRowProps {
  category: string;
  books: Book[] | undefined;
  isLoading: boolean;
  error?: string | null;
  onSelectBook: (book: Book) => void;
  isFavorite: (bookKey: string) => boolean;
  onToggleFavorite: (book: Book) => void;
  onViewMore: (category: string) => void;
  onSearchSeries: (seriesName: string) => void;
  onRequestDownload: (book: Book) => void;
  getDownloadCount: (bookKey: string) => number;
}

const SkeletonCard: React.FC = () => (
    <div className="flex-shrink-0 w-40">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
        <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
    </div>
);

const CategoryRow: React.FC<CategoryRowProps> = ({ category, books, isLoading, error, onSelectBook, isFavorite, onToggleFavorite, onViewMore, onSearchSeries, onRequestDownload, getDownloadCount }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -scrollContainerRef.current.clientWidth * 0.8 : scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!books || books.length === 0) && !error) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{category}</h2>
        <button 
          onClick={() => onViewMore(category)}
          className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline active:scale-95 transition-transform"
        >
          View More
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
      {error ? (
        <div className="text-center py-8 px-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-dashed border-red-400/50 dark:border-red-500/30">
          <p className="text-red-600 dark:text-red-400 font-medium">Could not load books for this category.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try again later.</p>
        </div>
      ) : (
        <div className="relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 hidden md:block shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6"/>
          </button>
          <div ref={scrollContainerRef} className="overflow-x-auto pb-4 -mb-4 scrollbar-hide scroll-fade-out">
            <div className="flex space-x-4">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => <SkeletonCard key={index} />)
              ) : (
                books?.map((book, index) => (
                  <div key={book.key} className="flex-shrink-0 w-40" style={{ animationDelay: `${index * 70}ms` }}>
                    <BookCard 
                        book={book} 
                        onSelect={onSelectBook} 
                        size="small" 
                        className="animate-fade-in-up"
                        isFavorite={isFavorite(book.key)}
                        onToggleFavorite={onToggleFavorite}
                        onSearchSeries={onSearchSeries}
                        onRequestDownload={onRequestDownload}
                        getDownloadCount={getDownloadCount}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 hidden md:block shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6"/>
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryRow;
