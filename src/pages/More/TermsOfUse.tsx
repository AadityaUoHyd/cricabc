import { type FC } from 'react';
import { motion } from 'framer-motion';

const TermsOfUse: FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Terms of Use
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing or using CricLive, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Use of Services</h2>
          <p className="text-gray-600 mb-4">
            CricLive provides live cricket scores, match schedules, fantasy cricket, and related content. You agree to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Use the platform for lawful purposes only.</li>
            <li>Not engage in unauthorized scraping or data extraction.</li>
            <li>Not post harmful or offensive content.</li>
            <li>Comply with all applicable laws and regulations.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Accounts</h2>
          <p className="text-gray-600 mb-4">
            To access certain features (e.g., fantasy cricket, admin panel), you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activities conducted under your account.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            All content on CricLive, including text, images, and logos, is owned by CricLive or its licensors. You may not reproduce, distribute, or modify content without permission.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Third-Party Content</h2>
          <p className="text-gray-600 mb-4">
            CricLive integrates with third-party services (e.g., CricAPI, Pusher). We are not responsible for the accuracy or availability of third-party content.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            CricLive is provided “as is” without warranties. We are not liable for:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Inaccuracies in match data or live scores.</li>
            <li>Losses due to platform downtime or errors.</li>
            <li>Damages from unauthorized access to your account.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Termination</h2>
          <p className="text-gray-600 mb-4">
            We may suspend or end your access to CricLive for violations of these terms, with or without notice.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We may revise these Terms of Use at any time. Changes will be posted on this page with an updated effective date.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
          <p className="text-gray-600">
            For questions about these Terms of Use, contact us at{' '}
            <a href="mailto:support@criclive.com" className="text-purple-600 hover:underline">
              support@criclive.com
            </a>{' '}
            or +91 99999 99999.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default TermsOfUse;