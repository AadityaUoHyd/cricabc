import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { type FC } from 'react';
import { motion } from 'framer-motion';
import  Logo  from '../../assets/cl.png'

const About: FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600 flex items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={Logo} alt="CricLive Logo" className="w-12 h-12" />
        About CricLive
      </motion.h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">Our Mission</h2>
          <p className="text-black mb-4">
            CricLive is dedicated to bringing cricket fans closer to the game they love. 
            Our mission is to provide real-time cricket updates, including live scores, 
            match schedules, and detailed statistics, all in one place. We aim to create 
            an engaging and seamless experience for fans to follow international and domestic 
            cricket, including events like the ICC Women's T20 World Cup Europe Division 2 Qualifier, 2025.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">What We Offer</h2>
          <ul className="list-disc list-inside text-black mb-4">
            <li>Live scores and ball-by-ball updates powered by real-time APIs.</li>
            <li>Comprehensive match schedules and archives for easy access.</li>
            <li>Fantasy cricket integration for an interactive fan experience.</li>
            <li>News, team details, player stats, and video highlights.</li>
            <li>Robust admin panel for managing match data and content.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">Our Technology</h2>
          <p className="text-black mb-4">
            CricLive is built with modern technologies to ensure performance and reliability.
            Our frontend uses React with TypeScript for a dynamic user interface, while the backend 
            leverages Spring Boot and MongoDB for efficient data management. Real-time updates are 
            powered by Pusher for live match notifications, and we integrate with CricAPI for accurate cricket data.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">Our Vision</h2>
          <p className="text-black">
            We envision CricLive as the go-to platform for cricket enthusiasts worldwide, offering unparalleled 
            access to live matches, in-depth analytics, and community-driven features. Join us as we continue to 
            enhance the cricket-watching experience!
          </p>
        </motion.section>
        <div className="mt-8">
          <Card>
            <div className="border-b px-4 py-2">
              <h3 className="text-xl font-semibold text-purple-800">Join Us</h3>
            </div>
            <div className="px-4 py-2">
              <p className="text-black">Be part of the CricLive community...</p>
            </div>
            <div className="border-t px-4 py-2">
              <Button variant="default" className="w-full bg-purple-600">
                Coming Soon
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
