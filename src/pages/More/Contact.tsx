import { type FC, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';

const Contact: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder for form submission logic (e.g., send to backend API)
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Contact Us
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            We're here to assist you with any questions or feedback about CricABC. Reach out to us via the form below or contact us directly.
          </p>
          <div className="mb-6">
            <p className="text-gray-600"><strong>Email:</strong> support@cricabc.com</p>
            <p className="text-gray-600"><strong>Mobile:</strong> +91 9999999999</p>
            <p className="text-gray-600"><strong>Address:</strong> 123 Cricket Lane, HiTech City, Hyderabad-500081, India</p>
          </div>
          {submitted ? (
            <p className="text-green-600 mb-4">Thank you for your message! We'll get back to you soon.</p>
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
                Send Message
              </Button>
            </form>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default Contact;