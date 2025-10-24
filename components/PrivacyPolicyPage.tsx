import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <LegalPageLayout title="Privacy Policy" onBack={onBack}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Interpretation and Definitions</h2>
        <p>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
        </p>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Collecting and Using Your Personal Data</h2>
        <p>
            This is a demonstration application and does not collect, store, or share any personal data from its users. We do not use cookies, tracking technologies, or analytics services. Your search queries are sent directly to the Open Library API and are not logged by us.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Third-Party Services</h2>
        <p>
            Our Service uses the Open Library API to fetch book data. Your interactions with this third-party service are governed by their own privacy policy. We encourage you to review the privacy policy of the Open Library and the Internet Archive.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Children's Privacy</h2>
        <p>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Changes to this Privacy Policy</h2>
        <p>
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, You can contact us at a placeholder email: contact@example.com.</p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;