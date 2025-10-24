import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const DisclaimerPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <LegalPageLayout title="Disclaimer" onBack={onBack}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
            The information provided by Raff ElKalimat ("we," "us," or "our") on this application is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
        </p>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">External Links Disclaimer</h2>
        <p>
            The application may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
        </p>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">No Professional Advice</h2>
        <p>
            The information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of professional advice. The use or reliance of any information contained on this site is solely at your own risk.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">API Data Disclaimer</h2>
        <p>
            All book data, including titles, authors, covers, and descriptions, is provided by the third-party Open Library API. We do not own, create, or verify this data. We are not responsible for any inaccuracies, errors, or omissions in the data provided by the API.
        </p>
    </LegalPageLayout>
  );
};

export default DisclaimerPage;