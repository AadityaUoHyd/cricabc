import { type FC } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Privacy Policy
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
          <p className="text-gray-600 mb-4">
            At CricABC, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website and services, including live scores, fantasy cricket, and match updates.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>
              <strong>Personal Information:</strong> When you register or contact us, we may collect your name, email address, and other contact details.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about your interactions with our site, such as pages visited, time spent, and IP address.
            </li>
            <li>
              <strong>Fantasy Cricket Data:</strong> If you participate in fantasy cricket, we collect your team selections and preferences.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to enhance your experience, track usage, and deliver personalized content.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Provide and improve our services, including live scores and match updates.</li>
            <li>Personalize your experience with tailored content and advertisements.</li>
            <li>Communicate with you about updates, promotions, or support inquiries.</li>
            <li>Analyze usage to enhance our platform’s performance and security.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Service providers (e.g., CricAPI, Pusher) to deliver our services.</li>
            <li>Advertisers for targeted campaigns, with your consent.</li>
            <li>Legal authorities if required by law.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Access, update, or delete your personal information.</li>
            <li>Opt out of marketing communications.</li>
            <li>Disable cookies via your browser settings.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@cricabc.com" className="text-purple-600 hover:underline">
              privacy@cricabc.com
            </a>.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Security</h2>
          <p className="text-gray-600 mb-4">
            We use industry-standard security measures, including encryption and secure servers, to protect your data. However, no online platform is completely secure, and we encourage you to safeguard your account credentials.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
          <p className="text-gray-600">
            For questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:support@cricabc.com" className="text-purple-600 hover:underline">
              support@cricabc.com
            </a>{' '}
            or +91 99999 99999.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;