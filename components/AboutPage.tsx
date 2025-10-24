import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const AboutPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <LegalPageLayout title="About Raff ElKalimat" onBack={onBack}>
      <p>
        Welcome to Raff ElKalimat, your personal gateway to the vast universe of literature. This application is designed for book lovers, students, and curious minds who wish to explore one of the largest digital libraries in the world.
      </p>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Our Mission</h2>
      <p>
        Our mission is simple: to provide a clean, fast, and user-friendly interface to access the millions of book records available through the Open Library API. We believe in the free and open access to information, and this tool is our contribution to that cause.
      </p>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Features</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Powerful Search:</strong> Instantly search for books, authors, or subjects across the entire Open Library catalog.</li>
        <li><strong>Curated Discovery:</strong> Browse hand-picked categories on the home page to discover new and interesting reads.</li>
        <li><strong>Detailed Information:</strong> View comprehensive details for each book, including descriptions, publication history, and subjects.</li>
        <li><strong>Responsive Design:</strong> Enjoy a seamless experience whether you are on a desktop, tablet, or mobile phone.</li>
      </ul>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Powered by Open Library</h2>
      <p>
        This entire application is powered by the public <a href="https://openlibrary.org/developers/api" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">Open Library API</a>, an initiative by the Internet Archive. We are immensely grateful for their work in digitizing and cataloging the world's books and making this data freely available.
      </p>
      <p>
        Thank you for using Raff ElKalimat. Happy reading!
      </p>
    </LegalPageLayout>
  );
};

export default AboutPage;