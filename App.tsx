import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Book, BookDetails, GenerateContentResponse } from './types';
import { searchBooks, getCoverUrl, getBookDetails } from './services/openLibraryService';
import { getGroundedBookInfo, getBookReviews, generateBookSummary } from './services/geminiService';
import { useDebounce } from './hooks/useDebounce';
import { useFavorites } from './hooks/useFavorites';
import { useBookReviews } from './hooks/useBookReviews';
import { useDownloadCount } from './hooks/useDownloadCount';
import BookCard from './components/BookCard';
import LoadingSpinner from './components/LoadingSpinner';
import { BookOpenIcon, SearchIcon, ArrowLeftIcon, CloseIcon, EyeIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, HeartIcon, BookmarkIcon, GlobeIcon, ShareIcon, TwitterIcon, FacebookIcon, InstagramIcon, LinkIcon, CheckIcon, SparklesIcon } from './components/icons';
import HomeView from './components/HomeView';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import DisclaimerPage from './components/DisclaimerPage';
import DMCAPage from './components/DMCAPage';
import FavoritesView from './components/FavoritesView';
import WelcomeModal from './components/WelcomeModal';
import ConfirmationModal from './components/ConfirmationModal';

type LegalPage = 'about' | 'privacy' | 'disclaimer' | 'dmca';
type View = 'main' | 'favorites' | LegalPage;
type Theme = 'light' | 'dark';
type SortOption = 'relevance' | 'title' | 'author' | 'year_desc';

const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'title', label: 'Title (A-Z)' },
  { key: 'author', label: 'Author (A-Z)' },
  { key: 'year_desc', label: 'Newest First' },
];

const Header: React.FC<{ onLogoClick: () => void, onViewFavorites: () => void, theme: Theme, onThemeToggle: () => void }> = ({ onLogoClick, onViewFavorites, theme, onThemeToggle }) => (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <button onClick={onLogoClick} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer transition-transform active:scale-95">
                <BookOpenIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Raff ElKalimat</h1>
            </button>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onViewFavorites}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="View favorites"
                >
                    <BookmarkIcon className="h-6 w-6" />
                </button>
                <button
                    onClick={onThemeToggle}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
            </div>
        </div>
    </header>
);

const DetailView: React.FC<{ book: Book; onBack: () => void; isFavorite: boolean; onToggleFavorite: (book: Book) => void; onSearchSeries: (seriesName: string) => void; onRequestDownload: (book: Book) => void; getDownloadCount: (bookKey: string) => number; }> = ({ book, onBack, isFavorite, onToggleFavorite, onSearchSeries, onRequestDownload, getDownloadCount }) => {
    const [details, setDetails] = useState<BookDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const [groundedInfo, setGroundedInfo] = useState<GenerateContentResponse | null>(null);
    const [isGroundedInfoLoading, setIsGroundedInfoLoading] = useState<boolean>(true);
    const [groundedInfoError, setGroundedInfoError] = useState<string | null>(null);

    const [aiReviews, setAiReviews] = useState<GenerateContentResponse | null>(null);
    const [isAiReviewsLoading, setIsAiReviewsLoading] = useState<boolean>(true);
    const [aiReviewsError, setAiReviewsError] = useState<string | null>(null);
    
    const [aiSummary, setAiSummary] = useState<GenerateContentResponse | null>(null);
    const [isAiSummaryLoading, setIsAiSummaryLoading] = useState<boolean>(false);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const { reviews: userReviews, addReview: addUserReview } = useBookReviews(book.key);
    const [newReviewText, setNewReviewText] = useState('');

    const downloadCount = getDownloadCount(book.key);

    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!book.key) return;
            
            // Fetch Open Library details
            setIsLoadingDetails(true);
            setDetailsError(null);
            try {
                const bookDetails = await getBookDetails(book.key);
                setDetails(bookDetails);
            } catch (error) {
                setDetailsError('Could not load book details.');
                console.error(error);
            } finally {
                setIsLoadingDetails(false);
            }

            // Fetch grounded info from Gemini
            setIsGroundedInfoLoading(true);
            setGroundedInfoError(null);
            try {
                const author = book.author_name?.[0] || '';
                const info = await getGroundedBookInfo(book.title, author);
                setGroundedInfo(info);
            } catch (error) {
                setGroundedInfoError('Could not load extra information from the web.');
                console.error(error);
            } finally {
                setIsGroundedInfoLoading(false);
            }

            // Fetch AI reviews from Gemini
            setIsAiReviewsLoading(true);
            setAiReviewsError(null);
            try {
                const author = book.author_name?.[0] || '';
                const reviewsData = await getBookReviews(book.title, author);
                setAiReviews(reviewsData);
            } catch (error) {
                setAiReviewsError('Could not load reviews from the web.');
                console.error(error);
            } finally {
                setIsAiReviewsLoading(false);
            }
        };
        fetchAllDetails();
    }, [book.key, book.title, book.author_name]);

    const handleGenerateSummary = async () => {
        setIsAiSummaryLoading(true);
        setAiSummaryError(null);
        setAiSummary(null);
        try {
            const author = book.author_name?.[0] || '';
            const summaryData = await generateBookSummary(book.title, author);
            setAiSummary(summaryData);
        } catch (error) {
            setAiSummaryError('Could not generate an AI summary for this book. Please try again.');
            console.error(error);
        } finally {
            setIsAiSummaryLoading(false);
        }
    };

    const shareUrl = `https://openlibrary.org${book.key}`;
    const shareText = `Check out this book: ${book.title} by ${book.author_name?.join(', ') || 'Unknown Author'}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const instagramUrl = `https://www.instagram.com`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book.title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                // User cancelling the share sheet is not an error.
                if (error instanceof DOMException && error.name === 'AbortError') {
                    // Silently ignore.
                } else {
                    console.error('Error sharing:', error);
                }
            }
        }
    };
    
    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addUserReview(newReviewText);
        setNewReviewText('');
    };

    const coverUrl = getCoverUrl(book, 'L');
    const sources = groundedInfo?.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web);

    const getDescription = (description?: BookDetails['description']): string => {
        if (!description) {
            return 'No description available for this book.';
        }
        if (typeof description === 'string') {
            return description;
        }
        if (typeof description === 'object' && description.value) {
            return description.value;
        }
        return 'No description available for this book.';
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
            <button
                onClick={onBack}
                className="mb-8 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full transition-all duration-200 shadow-lg active:scale-95 border border-gray-200 dark:border-gray-700"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="md:col-span-1">
                    {coverUrl ? (
                        <img src={coverUrl} alt={`Cover of ${book.title}`} className="rounded-lg shadow-2xl w-full" />
                    ) : (
                        <div className="aspect-[2/3] w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded-lg shadow-2xl">
                            <BookOpenIcon className="h-32 w-32 text-gray-400 dark:text-gray-600" />
                        </div>
                    )}
                    {book.ebook_access === 'public' && book.ia && book.ia[0] && (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                            <a
                                href={`https://archive.org/details/${book.ia[0]}/mode/2up`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md active:scale-95"
                            >
                                <EyeIcon className="h-5 w-5 mr-2" />
                                <span>Read Book</span>
                            </a>
                            <button
                                onClick={() => onRequestDownload(book)}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md active:scale-95"
                            >
                                <DownloadIcon className="h-5 w-5 mr-2" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    )}
                    <div className="mt-8">
                        <h4 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider text-center md:text-left">Share This Book</h4>
                        <div className="space-y-3">
                            {navigator.share && (
                                <button
                                    onClick={handleNativeShare}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
                                    aria-label="Share this book"
                                >
                                    <ShareIcon className="h-6 w-6 mr-3" />
                                    <span>Share...</span>
                                </button>
                            )}
                            <a
                                href={twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center px-4 py-3 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
                                aria-label="Share on Twitter"
                            >
                                <TwitterIcon className="h-6 w-6 mr-3" />
                                <span>Share on Twitter</span>
                            </a>
                            <a
                                href={facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center px-4 py-3 bg-[#4267B2] hover:bg-[#3B5998] text-white rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
                                aria-label="Share on Facebook"
                            >
                                <FacebookIcon className="h-6 w-6 mr-3" />
                                <span>Share on Facebook</span>
                            </a>
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5"
                                aria-label="Share on Instagram"
                                title="Instagram does not support direct link sharing. This will open Instagram."
                            >
                                <InstagramIcon className="h-6 w-6 mr-3" />
                                <span>Share on Instagram</span>
                            </a>
                            <button
                                onClick={handleCopyLink}
                                disabled={isLinkCopied}
                                className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5 disabled:opacity-70"
                                aria-label="Copy book link"
                            >
                                {isLinkCopied ? (
                                    <>
                                        <CheckIcon className="h-6 w-6 mr-3 text-green-500" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="h-6 w-6 mr-3" />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">{book.title}</h2>
                        <p className="mt-2 text-lg sm:text-xl text-gray-500 dark:text-gray-400">
                            by {book.author_name?.join(', ') || 'Unknown Author'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                              onClick={() => onToggleFavorite(book)}
                              className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors active:scale-90"
                              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                              <HeartIcon className={`h-7 w-7 ${isFavorite ? 'text-red-500' : ''}`} filled={isFavorite} />
                          </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {book.first_publish_year && (
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">First Published:</span> {book.first_publish_year}
                            </div>
                        )}
                        {book.publisher && book.publisher.length > 0 && (
                            <div className="flex-shrink min-w-0">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Publishers:</span>
                                <span className="truncate" title={book.publisher.join(', ')}> {book.publisher.slice(0, 2).join(', ')}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <DownloadIcon className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">Downloads:</span> {downloadCount.toLocaleString()}
                        </div>
                        {book.series && book.series[0] && (
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Series:</span>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSearchSeries(book.series![0]);
                                    }}
                                    className="text-teal-600 dark:text-teal-400 hover:underline ml-1"
                                >
                                    {book.series[0]}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Description</h3>
                        {isLoadingDetails && (
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse"></div>
                            </div>
                        )}
                        {detailsError && <p className="text-red-500 dark:text-red-400">{detailsError}</p>}
                        {!isLoadingDetails && !detailsError && (
                            <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none">
                                <p>{getDescription(details?.description)}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            <SparklesIcon className="h-6 w-6 mr-3 text-teal-600 dark:text-teal-400" />
                            AI-Generated Summary
                        </h3>
                        {isAiSummaryLoading && (
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse"></div>
                            </div>
                        )}
                        {!isAiSummaryLoading && aiSummary && (
                            <div>
                                <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none">
                                    <p>{aiSummary.text}</p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 italic">
                                    This summary is AI-generated and may not be completely accurate.
                                </p>
                            </div>
                        )}
                        {!isAiSummaryLoading && !aiSummary && (
                            <div className="flex flex-col items-start">
                                <button
                                    onClick={handleGenerateSummary}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md active:scale-95"
                                >
                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                    Generate Summary
                                </button>
                                {aiSummaryError && <p className="text-red-500 dark:text-red-400 mt-2 text-sm">{aiSummaryError}</p>}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        <GlobeIcon className="h-6 w-6 mr-3 text-teal-600 dark:text-teal-400" />
                        Latest from the Web
                      </h3>
                      {isGroundedInfoLoading && (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse"></div>
                        </div>
                      )}
                      {groundedInfoError && <p className="text-red-500 dark:text-red-400">{groundedInfoError}</p>}
                      {!isGroundedInfoLoading && !groundedInfoError && groundedInfo && (
                        <div>
                          <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none">
                            <p>{groundedInfo.text}</p>
                          </div>
                          
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 italic">
                            This summary is AI-generated using Google Search. Please check the sources for details.
                          </p>
                          
                          {sources && sources.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-700 dark:text-gray-200">Sources:</h4>
                              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                {sources.map((source, index) => source.web && (
                                  <li key={index}>
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                                      {source.web.title || source.web.uri}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">Reviews</h3>
                        
                        {/* AI-Generated Reviews */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Community Reviews (from the Web)</h4>
                            {isAiReviewsLoading && (
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5 animate-pulse"></div>
                                </div>
                            )}
                            {aiReviewsError && <p className="text-red-500 dark:text-red-400 text-sm">{aiReviewsError}</p>}
                            {!isAiReviewsLoading && !aiReviewsError && aiReviews && (
                                <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none space-y-4">
                                    {aiReviews.text.split('\n').filter(r => r.trim().length > 10).length > 0 ? (
                                        aiReviews.text.split('\n').filter(r => r.trim().length > 10).map((review, i) => (
                                            <blockquote key={i} className="border-l-4 border-teal-500 dark:border-teal-400 pl-4 italic">
                                                {review}
                                            </blockquote>
                                        ))
                                    ) : (
                                        <p>No community reviews could be found on the web for this book.</p>
                                    )}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                                        These reviews are AI-summarized using Google Search.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* User Reviews */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Add Your Review</h4>
                            <form onSubmit={handleReviewSubmit} className="mb-6">
                                <textarea
                                    value={newReviewText}
                                    onChange={(e) => setNewReviewText(e.target.value)}
                                    placeholder="Share your thoughts on this book..."
                                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/70 dark:focus:ring-teal-400/70 transition-shadow"
                                    rows={4}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!newReviewText.trim()}
                                >
                                    Submit Review
                                </button>
                            </form>

                            <div className="space-y-4">
                                {userReviews.length > 0 ? (
                                    userReviews.map((review, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 animate-fade-in-up" style={{ animationDelay: `${index * 70}ms` }}>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{review.text}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-right">
                                                Reviewed on {new Date(review.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">You haven't written a review for this book yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { incrementDownloadCount, getDownloadCount } = useDownloadCount();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);

  const [page, setPage] = useState<number>(1);
  const [numFound, setNumFound] = useState<number>(0);
  const [view, setView] = useState<View>('main');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [downloadTarget, setDownloadTarget] = useState<Book | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      const hasVisited = window.localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowWelcome(true);
        window.localStorage.setItem('hasVisited', 'true'); // Set immediately to prevent re-trigger on fast refresh
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 2000); // The user requested 2 seconds

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const performSearch = useCallback(async (searchQuery: string, currentPage: number) => {
    if (!searchQuery) {
      setResults([]);
      setNumFound(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchBooks(searchQuery, currentPage);
      setResults(data.docs);
      setNumFound(data.numFound);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery, page);
  }, [debouncedQuery, page, performSearch]);

  const sortedResults = useMemo(() => {
    if (sortOption === 'relevance') {
      return results;
    }
    const sorted = [...results];
    if (sortOption === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'author') {
      sorted.sort((a, b) => {
        const authorA = a.author_name?.[0];
        const authorB = b.author_name?.[0];
        if (authorA && authorB) return authorA.localeCompare(authorB);
        if (authorA) return -1;
        if (authorB) return 1;
        return 0;
      });
    } else if (sortOption === 'year_desc') {
      sorted.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
    }
    return sorted;
  }, [results, sortOption]);

  const toggleFavorite = (book: Book) => {
    if (isFavorite(book.key)) {
      removeFavorite(book.key);
    } else {
      addFavorite(book);
    }
  };
  
  const handleRequestDownload = (book: Book) => {
    setDownloadTarget(book);
  };

  const handleConfirmDownload = () => {
    if (downloadTarget && downloadTarget.ia?.[0]) {
      incrementDownloadCount(downloadTarget.key);
      const url = `https://archive.org/download/${downloadTarget.ia[0]}/${downloadTarget.ia[0]}.pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${downloadTarget.title.replace(/ /g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setDownloadTarget(null);
  };

  const handleCancelDownload = () => {
      setDownloadTarget(null);
  };

  const handleSelectBook = (book: Book) => {
      setSelectedBook(book);
      window.scrollTo(0, 0);
  };
  
  const handleBackFromDetail = () => {
      setSelectedBook(null);
  };

  const handleBackToMain = () => {
      setSelectedBook(null);
      setView('main');
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
    setSortOption('relevance');
  };

  const handleClearQuery = () => {
    setQuery('');
    setPage(1);
    setSortOption('relevance');
  };

  const handleSetLegalPage = (page: LegalPage) => {
    setView(page);
    setSelectedBook(null);
    window.scrollTo(0, 0);
  };
  
  const handleViewFavorites = () => {
    setView('favorites');
    setSelectedBook(null);
    window.scrollTo(0, 0);
  };
  
  const handleViewMore = (category: string) => {
    setQuery(category);
    setPage(1);
    setSortOption('relevance');
    window.scrollTo(0, 0);
  };

  const handleSearchSeries = (seriesName: string) => {
    setSelectedBook(null);
    setQuery(`series:"${seriesName}"`);
    setPage(1);
    setSortOption('relevance');
    setView('main');
    window.scrollTo(0, 0);
  };

  const totalPages = Math.ceil(numFound / 40);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderContent = () => {
    if (selectedBook) {
      return <DetailView book={selectedBook} onBack={handleBackFromDetail} isFavorite={isFavorite(selectedBook.key)} onToggleFavorite={toggleFavorite} onSearchSeries={handleSearchSeries} onRequestDownload={handleRequestDownload} getDownloadCount={getDownloadCount} />;
    }
    
    switch(view) {
        case 'about': return <AboutPage onBack={handleBackToMain} />;
        case 'privacy': return <PrivacyPolicyPage onBack={handleBackToMain} />;
        case 'disclaimer': return <DisclaimerPage onBack={handleBackToMain} />;
        case 'dmca': return <DMCAPage onBack={handleBackToMain} />;
        case 'favorites': return <FavoritesView favoriteBooks={favorites} onSelectBook={handleSelectBook} onToggleFavorite={toggleFavorite} isFavorite={isFavorite} onBack={handleBackToMain} onSearchSeries={handleSearchSeries} onRequestDownload={handleRequestDownload} getDownloadCount={getDownloadCount} />;
        case 'main':
        default:
            return (
                <div className="container mx-auto p-4 md:p-8">
                    <div className="mb-4">
                        <div className="relative w-full">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={handleQueryChange}
                                placeholder="Search for books, authors, or subjects..."
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full py-2.5 sm:py-3 pl-12 pr-10 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/70 dark:focus:ring-teal-400/70 transition-shadow"
                            />
                            {query && (
                                <button onClick={handleClearQuery} className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-transform active:scale-90">
                                    <CloseIcon />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {!isLoading && results.length > 0 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mb-8 text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400 mr-2">Sort by:</span>
                            {sortOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setSortOption(option.key)}
                                    className={`px-3 py-1.5 rounded-full transition-all duration-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-teal-500/80 active:scale-95 ${
                                        sortOption === option.key
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}

                    {!isLoading && !error && !debouncedQuery && (
                        <HomeView onSelectBook={handleSelectBook} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} onViewMore={handleViewMore} onSearchSeries={handleSearchSeries} onRequestDownload={handleRequestDownload} getDownloadCount={getDownloadCount} />
                    )}

                    {!isLoading && !error && debouncedQuery && results.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">No results found for "{debouncedQuery}".</p>
                    )}
                    
                    {!isLoading && !error && results.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {sortedResults.map((book, index) => (
                                    <BookCard 
                                      key={book.key} 
                                      book={book} 
                                      onSelect={handleSelectBook}
                                      isFavorite={isFavorite(book.key)}
                                      onToggleFavorite={toggleFavorite}
                                      onSearchSeries={handleSearchSeries}
                                      onRequestDownload={handleRequestDownload}
                                      getDownloadCount={getDownloadCount}
                                      style={{ animationDelay: `${index * 50}ms` }}
                                      className="animate-fade-in-up"
                                    />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-8 text-gray-600 dark:text-gray-400">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={page <= 1}
                                        className="p-2 bg-white dark:bg-gray-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95 border border-gray-300 dark:border-gray-700"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>
                                    <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={page >= totalPages}
                                        className="p-2 bg-white dark:bg-gray-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95 border border-gray-300 dark:border-gray-700"
                                        aria-label="Next page"
                                    >
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            );
    }
  };


  return (
    <div className="min-h-screen font-sans flex flex-col">
      {showWelcome && <WelcomeModal />}
      <Header onLogoClick={handleBackToMain} onViewFavorites={handleViewFavorites} theme={theme} onThemeToggle={handleThemeToggle} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12 py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Raff ElKalimat. All Rights Reserved.</p>
            <p className="mt-1">Powered by the <a href="https://openlibrary.org/developers/api" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">Open Library API</a>.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button onClick={() => handleSetLegalPage('about')} className="hover:text-gray-900 dark:hover:text-gray-100 transition-all active:scale-95">About</button>
              <button onClick={() => handleSetLegalPage('privacy')} className="hover:text-gray-900 dark:hover:text-gray-100 transition-all active:scale-95">Privacy Policy</button>
              <button onClick={() => handleSetLegalPage('disclaimer')} className="hover:text-gray-900 dark:hover:text-gray-100 transition-all active:scale-95">Disclaimer</button>
              <button onClick={() => handleSetLegalPage('dmca')} className="hover:text-gray-900 dark:hover:text-gray-100 transition-all active:scale-95">DMCA</button>
            </div>
            <div className="flex items-center space-x-5">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ConfirmationModal
        isOpen={!!downloadTarget}
        onClose={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        title="Confirm Download"
      >
        <p>Are you sure you want to download the PDF for <strong className="text-gray-800 dark:text-gray-100">{downloadTarget?.title}</strong>?</p>
      </ConfirmationModal>
    </div>
  );
};

export default App;
