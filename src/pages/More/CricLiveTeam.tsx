import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Star } from 'lucide-react';
import { FaCode, FaChartLine } from 'react-icons/fa';
import { PiCricketFill } from "react-icons/pi";

const teamMembers = [
  {
    name: 'Aaditya B Chatterjee',
    role: 'Founder & CEO',
    image: 'https://raw.githubusercontent.com/AadityaUoHyd/the-platenet/refs/heads/main/aadi.jpg',
    description:
      'Aaditya is a cricket enthusiast with over 10 years of experience in tech startups. He founded CricLive to bring real-time cricket updates to fans worldwide. His vision drives our mission to create the ultimate cricket platform.',
    icon: <PiCricketFill className="text-purple-600 w-6 h-6" />,
  },
  {
    name: 'Shreya Kiki',
    role: 'Lead Developer',
    image: 'https://b2bblogassets.airtel.in/wp-content/uploads/2022/06/small-business-ideas-scaled.jpg',
    description:
      'Priya leads our development team, specializing in React and Spring Boot. With a passion for clean code and user-friendly interfaces, she ensures CricLive delivers a seamless experience for fans.',
    icon: <FaCode className="text-purple-600 w-6 h-6" />,
  },
  {
    name: 'Sameer Bhardawaj',
    role: 'Data Analyst',
    image: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8SW5kaWVufGVufDB8fDB8fHww&w=1000&q=80',
    description:
      'Vikram crunches match data to provide insightful stats and predictions. His expertise in MongoDB and real-time APIs like CricAPI powers our live scores and analytics features.',
    icon: <FaChartLine className="text-purple-600 w-6 h-6" />,
  },
  {
    name: 'Julie Sharma',
    role: 'UI/UX Designer',
    image: 'https://interfaceauto.com/website/images/dummy-2.webp',
    description:
      'Neha crafts CricLive’s intuitive and vibrant interface. Her designs, powered by Tailwind and Framer Motion, make navigating live scores and fantasy cricket a delight for users.',
    icon: <Star className="text-purple-600 w-6 h-6" />,
  },
  {
    name: 'Arvind Singh',
    role: 'Content Manager',
    image: 'https://images.unsplash.com/photo-1622151834677-70f982c9adef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGJ1c2luZXNzJTIwbWFufGVufDB8fDB8fA%3D%3D&w=1000&q=80',
    description:
      'Rahul curates engaging news, videos, and match highlights. His deep knowledge of cricket ensures CricLive’s content keeps fans informed and entertained.',
    icon: <Award className="text-purple-600 w-6 h-6" />,
  },
  {
    name: 'Saptorishi Chakraborty',
    role: 'Community Manager',
    image: 'https://tse2.mm.bing.net/th?id=OIP.dh4WwKODT5hJIQPQejAdbQHaHa&pid',
    description:
      'Anup connects with our global fanbase, managing social media and community events. He fosters a vibrant CricLive community, from IPL fans to international cricket lovers.',
    icon: <Users className="text-purple-600 w-6 h-6" />,
  },
];

const CricLiveTeam: FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Meet the CricLive Team
      </motion.h1>
      <motion.p
        className="text-center text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Our passionate team of cricket lovers and tech experts works tirelessly to bring you the best cricket experience. From live scores to fantasy cricket, we’re here to make every match unforgettable.
      </motion.p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-48 object-cover"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Team+Member')}
            />
            <div className="p-4 sm:p-6">
              <div className="flex items-center mb-2">
                {member.icon}
                <h3 className="ml-2 text-xl font-semibold text-gray-800">{member.name}</h3>
              </div>
              <p className="text-purple-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CricLiveTeam;