import React from 'react';
import { ArrowLeftIcon } from './icons';

interface LegalPageLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, onBack, children }) => {
  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      <button
        onClick={onBack}
        className="mb-8 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full transition-all duration-200 shadow-lg active:scale-95 border border-gray-200 dark:border-gray-700"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">{title}</h1>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalPageLayout;