import {
  OpenLibrarySearchResponse,
  Book,
  BookDetails,
  OpenLibrarySubjectResponse,
  SubjectWork,
} from '../types';

const API_BASE_URL = 'https://openlibrary.org';

const fetchWithRetry = async (url: string, retries = 3, initialDelay = 500): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      if (response.status >= 400 && response.status < 500) {
        // Don't retry on client errors like 404
        throw new Error(`Client-side error: ${response.status}`);
      }
      // For 5xx server errors, we will fall through and retry
    } catch (error) {
      // This catches network errors (e.g., "Failed to fetch") and client errors thrown above
      if (error instanceof Error && error.message.startsWith('Client-side error')) {
        throw error; // Fail immediately, don't retry client errors
      }
      if (i === retries - 1) {
        throw error; // Last attempt failed, rethrow
      }
    }
    // Wait with exponential backoff before retrying
    await new Promise(res => setTimeout(res, initialDelay * Math.pow(2, i)));
  }
  throw new Error('Failed to fetch after multiple retries');
};


export const searchBooks = async (query: string, page: number): Promise<OpenLibrarySearchResponse> => {
  if (!query) {
    return { numFound: 0, docs: [] };
  }
  try {
    const url = `${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i,first_publish_year,publisher,isbn,subject,ia,ebook_access&limit=40&page=${page}`;
    
    const response = await fetchWithRetry(url);
    const data: OpenLibrarySearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch books:", error);
    throw error;
  }
};

export const getCoverUrl = (book: Book, size: 'S' | 'M' | 'L' = 'L'): string | null => {
  if (book.isbn && book.isbn[0]) {
    return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-${size}.jpg`;
  }
  if (book.cover_i) {
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
  }
  return null;
};

export const getBookDetails = async (key: string): Promise<BookDetails> => {
  if (!key) {
    throw new Error('A book key must be provided.');
  }
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${key}.json`);
    const data: BookDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch book details for key ${key}:`, error);
    throw error;
  }
};

export const getBooksBySubject = async (subject: string, limit: number = 50): Promise<Book[]> => {
  const subjectKey = subject.toLowerCase().replace(/ /g, '_');
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/subjects/${subjectKey}.json?limit=${limit}`);
    const data: OpenLibrarySubjectResponse = await response.json();
    
    // Map SubjectWork to Book
    const books: Book[] = data.works.map((work: SubjectWork) => ({
      key: work.key,
      title: work.title,
      author_name: work.authors?.map(a => a.name),
      cover_i: work.cover_id,
      first_publish_year: work.first_publish_year,
      ia: work.ia ? (Array.isArray(work.ia) ? work.ia : [work.ia]) : undefined,
      ebook_access: work.has_fulltext ? 'public' : undefined,
      subject: work.subject,
    }));

    return books;
  } catch (error) {
    console.error(`Failed to fetch books for subject ${subject}:`, error);
    throw error;
  }
};