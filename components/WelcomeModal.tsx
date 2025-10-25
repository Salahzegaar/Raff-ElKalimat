import React from 'react';
import { BookOpenIcon } from './icons';

const WelcomeModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-800 animate-fade-in-up"
        style={{ animationDuration: '0.7s' }}
      >
        <BookOpenIcon className="h-16 w-16 text-teal-600 dark:text-teal-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
          أهلاً بك في رف الكلمات
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          مكتبتك لاستكشاف ملايين الكتب
        </p>
      </div>
    </div>
  );
};

export default WelcomeModal;
