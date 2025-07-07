import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

const Career: FC = () => {
  const jobOpenings = [
    {
      title: 'Frontend Developer (React/TypeScript)',
      description:
        'Join our team to build dynamic, responsive UI components for CricLive using React and TypeScript. Experience with Tailwind CSS and Framer Motion is a plus.',
      requirements: ['3+ years of React experience', 'Proficiency in TypeScript', 'Knowledge of REST APIs'],
    },
    {
      title: 'Backend Developer (Spring Boot)',
      description:
        'Develop and maintain our Spring Boot backend, integrating with MongoDB and external APIs like CricAPI. Ensure high performance and real-time data delivery.',
      requirements: ['Experience with Spring Boot', 'Familiarity with MongoDB', 'Understanding of RESTful APIs'],
    },
    {
      title: 'Full Stack Developer',
      description:
        'Work across the CricLive stack, from React frontend to Spring Boot backend, to deliver seamless features and real-time updates using Pusher.',
      requirements: ['Expertise in React and Spring Boot', 'Experience with WebSockets', 'Strong problem-solving skills'],
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Careers at CricLive
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Join Our Team</h2>
          <p className="text-gray-600 mb-4">
            At CricLive, we're passionate about cricket and technology. Join our innovative team to build the ultimate platform for cricket fans worldwide. We offer a dynamic work environment, opportunities for growth, and the chance to work with cutting-edge technologies.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Open Positions</h2>
          {jobOpenings.map((job, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-medium text-gray-800">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.description}</p>
              <ul className="list-disc list-inside text-gray-600 mb-2">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
              <Link to="/contact">
                <Button className="bg-purple-600 text-white hover:bg-purple-700">Apply Now</Button>
              </Link>
            </div>
          ))}
          <p className="text-gray-600">
            Don't see a role that fits? Reach out to us at{' '}
            <a href="mailto:careers@criclive.com" className="text-purple-600 hover:underline">
              careers@criclive.com
            </a>{' '}
            to express your interest!
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default Career;