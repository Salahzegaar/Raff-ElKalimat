import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const DMCAPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <LegalPageLayout title="DMCA Policy" onBack={onBack}>
      <p>
        Raff ElKalimat respects the intellectual property rights of others. Per the DMCA, we will respond expeditiously to claims of copyright infringement on the Site if submitted to our Copyright Agent as described below.
      </p>
      
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Notice of Copyright Infringement</h2>
      <p>
        If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by submitting a notice that includes the following information:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Identification of the copyrighted work that you claim has been infringed.</li>
        <li>A description of where the material that you claim is infringing is located on our Site.</li>
        <li>Your address, telephone number, and email address.</li>
        <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
        <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or are authorized to act on the copyright owner's behalf.</li>
        <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
      </ul>
      
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 !mt-6">Submitting a Notice</h2>
      <p>
        Please note that this application is a client for the Open Library API. We do not host any of the content displayed. All infringement claims should be directed to the source of the content, which is the Internet Archive and Open Library.
      </p>
      <p>
        However, if you believe there is an issue with how our application presents the content, you may contact our designated Copyright Agent at a placeholder email: <strong>dmca@example.com</strong>.
      </p>
    </LegalPageLayout>
  );
};

export default DMCAPage;