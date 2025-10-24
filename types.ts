
export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  subject?: string[];
  ia?: string[];
  ebook_access?: string;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: Book[];
}

export interface BookDetails {
  key: string;
  title: string;
  description?: string | { type: string; value: string };
  subjects?: string[];
  covers?: number[];
}

export interface SubjectWorkAuthor {
  key: string;
  name: string;
}

export interface SubjectWork {
  key: string;
  title: string;
  authors: SubjectWorkAuthor[];
  cover_id?: number;
  first_publish_year?: number;
  ia?: string | string[];
  has_fulltext?: boolean;
  subject?: string[];
}

export interface OpenLibrarySubjectResponse {
  works: SubjectWork[];
}

// Types for Gemini API with Search Grounding
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface Candidate {
  content: {
    parts: { text: string }[];
  };
  groundingMetadata?: GroundingMetadata;
}

export interface GenerateContentResponse {
  text: string;
  candidates?: Candidate[];
}

export interface UserReview {
  text: string;
  date: string;
}
