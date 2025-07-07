import { type FC, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';

const Advertise: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company || !formData.message) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setSubmitted(true);
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Advertise with CricLive
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reach Cricket Fans Worldwide</h2>
          <p className="text-gray-600 mb-4">
            CricLive is the premier destination for cricket enthusiasts, offering real-time scores, match updates, and engaging content for fans across the globe. Partner with us to reach a passionate audience during high-profile events like the ICC ODI and T20 World Cups, World Test Championships, bilateral tournaments, and IPL seasons.
          </p>
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">Advertising Opportunities</h3>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Banner ads on live score pages and match summaries.</li>
            <li>Sponsored content in our news and video sections.</li>
            <li>Native ads integrated with fantasy cricket features.</li>
            <li>Custom campaigns tailored to your brand’s goals.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Our platform attracts millions of cricket fans, providing a unique opportunity to connect with a dedicated audience. Contact our advertising team to discuss customized solutions.
          </p>
          <div className="mb-6">
            <p className="text-gray-600"><strong>Email:</strong> ads@criclive.com</p>
            <p className="text-gray-600"><strong>Mobile:</strong> +91 99999 99999</p>
          </div>
          {submitted ? (
            <p className="text-green-600 mb-4">Thank you for your inquiry! Our team will reach out soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="bg-purple-600 text-white hover:bg-purple-700">
                Submit Inquiry
              </Button>
            </form>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default Advertise;