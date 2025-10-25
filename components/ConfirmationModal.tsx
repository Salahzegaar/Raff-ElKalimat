import React from 'react';
import { CloseIcon, DownloadIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" 
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close dialog">
            <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-400 mb-6">
          {children}
        </div>
        <div className="flex justify-end items-center gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md active:scale-95 flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Confirm Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
