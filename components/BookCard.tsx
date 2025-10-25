import React, { useState } from 'react';
import { Book, BookDetails } from '../types';
import { getCoverUrl, getBookDetails } from '../services/openLibraryService';
import { BookOpenIcon, EyeIcon, DownloadIcon, HeartIcon, StarIcon } from './icons';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  size?: 'normal' | 'small';
  style?: React.CSSProperties;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (book: Book) => void;
  onSearchSeries?: (seriesName: string) => void;
  onRequestDownload: (book: Book) => void;
  getDownloadCount: (bookKey: string) => number;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect, size = 'normal', style, className, isFavorite, onToggleFavorite, onSearchSeries, onRequestDownload, getDownloadCount }) => {
  const coverUrl = getCoverUrl(book, size === 'small' ? 'M' : 'L');
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isFetchingDescription, setIsFetchingDescription] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  
  const downloadCount = getDownloadCount(book.key);

  const containerClasses = `bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer group flex flex-col border border-gray-200 dark:border-gray-800 hover:border-teal-500/50 dark:hover:border-teal-400/50 active:scale-95 ${className || ''}`;
  const imageContainerHeight = size === 'small' ? 'h-48' : 'h-64';
  const paddingContainer = size === 'small' ? 'p-3' : 'p-4';
  const titleClasses = size === 'small' 
    ? "text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" 
    : "text-lg font-bold text-gray-800 dark:text-gray-100 truncate";
  const authorClasses = size === 'small' 
    ? "text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" 
    : "text-sm text-gray-500 dark:text-gray-400 mt-1 truncate";
  const iconClasses = size === 'small' ? 'h-16 w-16 text-gray-400 dark:text-gray-500' : 'h-24 w-24 text-gray-400 dark:text-gray-500';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(book);
  };

  const handleSeriesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.series && onSearchSeries) {
        onSearchSeries(book.series[0]);
    }
  };
  
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDownload(book);
  };

  const getDescriptionString = (d?: BookDetails['description']): string => {
    if (!d) return 'No description available for this book.';
    if (typeof d === 'string') return d;
    if (typeof d === 'object' && d.value) return d.value;
    return 'No description available for this book.';
  };

  const handleMouseEnter = async () => {
    if (hasFetched || isFetchingDescription) {
      return;
    }
    
    setIsFetchingDescription(true);
    setHasFetched(true);

    try {
      const details = await getBookDetails(book.key);
      setDescription(getDescriptionString(details.description));
    } catch (error) {
      console.error(`Failed to fetch description for ${book.title}`, error);
      setDescription('Could not load description.');
    } finally {
      setIsFetchingDescription(false);
    }
  };

  return (
    <div
      className={containerClasses}
      onClick={() => onSelect(book)}
      onMouseEnter={handleMouseEnter}
      style={style}
    >
      <div className={`relative ${imageContainerHeight} bg-gray-200 dark:bg-gray-800 flex items-center justify-center`}>
        {onToggleFavorite && (
            <button
                onClick={handleFavoriteClick}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 z-10 ${
                    isFavorite
                        ? 'bg-red-500/80 text-white'
                        : 'bg-black/40 text-white hover:bg-black/60'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <HeartIcon className="h-4 w-4" filled={isFavorite} />
            </button>
        )}
        {coverUrl ? (
          <img src={coverUrl} alt={`Cover for ${book.title}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <BookOpenIcon className={iconClasses} />
        )}
        {book.ebook_access === 'public' && book.ia?.[0] && (
          <button
            onClick={handleDownloadClick}
            className="absolute bottom-2 left-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white z-10 transition-all duration-300 opacity-0 group-hover:opacity-100"
            title="Download PDF"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
          {isFetchingDescription ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white/80"></div>
          ) : (
            description && (
              <p
                className="text-white text-xs leading-snug"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: size === 'small' ? 5 : 7,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={description}
              >
                {description}
              </p>
            )
          )}
        </div>
      </div>
      <div className={`${paddingContainer} flex flex-col flex-grow`}>
        <div className="flex-grow">
            <h3 className={titleClasses} title={book.title}>
              {book.title}
            </h3>
            <p className={authorClasses}>
              {book.author_name?.join(', ') || 'Unknown Author'}
            </p>
            {book.series && book.series[0] && (
              <a
                onClick={handleSeriesClick}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline mt-1 truncate block font-medium"
                title={book.series[0]}
              >
                {book.series[0]}
              </a>
            )}
            
            {size === 'small' ? (
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <StarIcon className="h-3.5 w-3.5 text-amber-400" filled />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-medium">
                            4.5
                        </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <DownloadIcon className="h-3 w-3 mr-0.5" />
                      <span>{downloadCount.toLocaleString()}</span>
                    </div>
                </div>
            ) : (
              <>
                {book.subject && book.subject.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {book.subject.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-xs bg-teal-50 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-medium px-2 py-0.5 rounded-full truncate" title={s}>
                                {s}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-3 flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-amber-400" filled />
                        <span className="ml-1.5 text-sm font-medium">4.5</span>
                    </div>
                    <div className="flex items-center text-xs">
                        <DownloadIcon className="h-3 w-3 mr-1" />
                        <span>{downloadCount.toLocaleString()}</span>
                    </div>
                    {book.first_publish_year && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-2 py-1 rounded-full">
                            {book.first_publish_year}
                        </span>
                    )}
                </div>
              </>
            )}
        </div>
        
        {size === 'normal' && book.ebook_access === 'public' && book.ia?.[0] && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
              <a
                  href={`https://archive.org/details/${book.ia[0]}/mode/2up`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-all duration-200 text-xs font-semibold shadow-sm active:scale-95"
                  title="Read this book online"
              >
                  <EyeIcon className="h-4 w-4 mr-1.5" />
                  Read
              </a>
              <button
                  onClick={handleDownloadClick}
                  className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md transition-all duration-200 text-xs font-semibold shadow-sm active:scale-95"
                  title="Download PDF of this book"
              >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Download
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
