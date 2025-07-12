import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Zap, Shield, Clock, Wrench, Star, Globe, Heart } from 'lucide-react';
import { PiCricketFill } from 'react-icons/pi';
import { MdSportsCricket } from 'react-icons/md';
import { FaHistory, FaStar } from 'react-icons/fa';

// Use a local image or a proper import
const cricketImage = 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1752302971/ff_nybtqf.jpg';

const KnowYourCricket: React.FC = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: 'easeOut' as const
      } 
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white font-sans">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900">
          <img
            src={cricketImage}
            alt="Boy playing cricket"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(to bottom right, #7c3aed, #9f7aea)';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                Welcome to the Awesome World of Cricket!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
              >
                Discover the thrill of cricket with CricABC—your guide to this exciting sport!
              </motion.p>
              <motion.a
                href="#"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block bg-white text-purple-600 font-semibold py-3 px-6 rounded-full hover:bg-purple-100 transition-colors"
              >
                Join CricAbcSocial
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is Cricket? */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <PiCricketFill className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">What is Cricket?</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Cricket is an exciting outdoor game played with a bat, ball, and stumps, like a grand adventure on a grassy field! Two teams take turns batting to score runs and fielding to stop the other team. Played on a 22-yard pitch, it’s a global favorite in countries like India, Australia, and England. Imagine it as a treasure hunt where every run counts toward victory!
          </p>
        </motion.section>

        {/* Objective of Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Trophy className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">What’s the Goal?</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            The aim is to outscore your opponents! The batting team hits the ball and runs between stumps to score points, called runs. The fielding team tries to catch the ball or hit the stumps to get batters out. It’s like a race to stack up the most points before the game wraps up!
          </p>
        </motion.section>

        {/* Teams in Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Who Plays?</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Cricket involves two teams of 11 players each. One team bats to score runs, while the other fields to prevent them. Each team gets a turn to bat and field, called an innings. Think of it as two groups of friends competing in an epic playground showdown!
          </p>
        </motion.section>

        {/* How to Play Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Zap className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How Does It Work?</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Here’s a simple breakdown of how cricket is played:
          </p>
          <ul className="list-none space-y-4 text-lg text-gray-700">
            {[
              {
                title: 'The Pitch',
                description: 'The game unfolds on a 22-yard strip called the pitch, with three stumps at each end, like mini goalposts.',
              },
              {
                title: 'Batting',
                description: 'Two batters stand at opposite ends, facing a bowler who throws the ball to hit the stumps.',
              },
              {
                title: 'Running',
                description: 'After hitting the ball, batters run between the stumps to score runs—each run is one point!',
              },
              {
                title: 'Fielding',
                description: 'The fielding team catches the ball or throws it to hit the stumps to get batters out.',
              },
              {
                title: 'Innings',
                description: 'Each team bats and fields once or twice, depending on the game format.',
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Star className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <strong>{item.title}:</strong> {item.description}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Rules of Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Rules Made Simple</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Cricket’s rules keep the game fair and fun:
          </p>
          <ul className="list-none space-y-4 text-lg text-gray-700">
            {[
              {
                title: 'Outs',
                description:
                  'A batter is out if the ball hits the stumps, is caught, or if they’re outside the safe zone (crease) when the stumps are hit.',
              },
              {
                title: 'Overs',
                description: 'A bowler delivers 6 balls, called an over, before another bowler takes over.',
              },
              {
                title: 'No-Ball',
                description: 'An unfair delivery (e.g., too high) gives the batting team a free run.',
              },
              {
                title: 'Wide',
                description: 'A ball too far from the batter to hit earns the batting team an extra run.',
              },
              {
                title: 'Umpires',
                description: 'Two umpires ensure everyone plays by the rules, like referees in other sports.',
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Shield className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <strong>{item.title}:</strong> {item.description}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Cricket Formats */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Clock className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Types of Cricket Games</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Cricket offers different formats, like choosing your adventure:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Test Cricket',
                description: 'The longest format, played over 5 days with two innings per team. It’s a strategic marathon!',
                icon: <Clock className="h-6 w-6 text-purple-600" />,
              },
              {
                title: 'One Day International (ODI)',
                description: 'A fast-paced game with 50 overs per team, completed in a day, like a sports festival.',
                icon: <Zap className="h-6 w-6 text-purple-600" />,
              },
              {
                title: 'T20',
                description: 'The shortest, most thrilling format with 20 overs per team, done in 3 hours.',
                icon: <Star className="h-6 w-6 text-purple-600" />,
              },
            ].map((format, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  {format.icon}
                  <h3 className="text-lg font-semibold text-gray-800">{format.title}</h3>
                </div>
                <p className="text-gray-600">{format.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Equipment Needed */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Wrench className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">What Do You Need?</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            To play cricket, grab these essentials:
          </p>
          <ul className="list-none space-y-4 text-lg text-gray-700">
            {[
              { title: 'Bat', description: 'A wooden bat to hit the ball, like a hero’s weapon.' },
              { title: 'Ball', description: 'A hard ball, red for Tests, white for ODIs and T20s.' },
              { title: 'Stumps', description: 'Three sticks with two bails, like a mini castle to defend.' },
              { title: 'Pads and Gloves', description: 'Protective gear for batters, like armor.' },
              { title: 'Helmet', description: 'A must for safety against fast balls.' },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Wrench className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <strong>{item.title}:</strong> {item.description}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Scoring in Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Star className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How to Score Runs</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Scoring in cricket is like racking up points in a game:
          </p>
          <ul className="list-none space-y-4 text-lg text-gray-700">
            {[
              {
                title: 'Running',
                description: 'Run between the stumps after hitting the ball to score 1 run per exchange.',
              },
              {
                title: 'Boundaries',
                description: 'Hit the ball to the field’s edge for 4 runs, or over it for 6 runs.',
              },
              {
                title: 'Extras',
                description: 'Earn extra runs from no-balls, wides, or byes when the ball slips past fielders.',
              },
              {
                title: 'Winning',
                description: 'The team with the most runs at the end takes the victory!',
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Star className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <strong>{item.title}:</strong> {item.description}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* History of Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <FaHistory className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">A Brief History of Cricket</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Cricket began in England in the 16th century as a children’s game and grew into a global sport. By the 18th century, it was played by adults, with the first recorded match in 1709. The Marylebone Cricket Club (MCC), founded in 1787, set the official rules, and cricket spread to countries like India, Australia, and South Africa through British colonies. Today, it’s a worldwide phenomenon with thrilling formats like T20!
          </p>
        </motion.section>

        {/* Famous Cricket Players */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <FaStar className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Cricket Legends</h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Meet some of cricket’s biggest stars who’ve inspired millions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Sachin Tendulkar',
                description: 'Known as the “Master Blaster,” this Indian batter holds the record for most international runs.',
              },
              {
                name: 'Sir Don Bradman',
                description: 'Australia’s legendary batter with an unmatched Test average of 99.94.',
              },
              {
                name: 'Viv Richards',
                description: 'West Indies’ fearless batter, known for dominating bowlers in the 1970s and 80s.',
              },
            ].map((player, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FaStar className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-800">{player.name}</h3>
                </div>
                <p className="text-gray-600">{player.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Global Impact of Cricket */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Globe className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Cricket’s Global Impact</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Cricket unites people across the globe, from packed stadiums in India to sunny fields in Australia. It’s more than a game—it’s a cultural celebration! Events like the Cricket World Cup and Indian Premier League (IPL) bring fans together, creating lifelong memories. Cricket also promotes teamwork, discipline, and passion, inspiring young players everywhere.
          </p>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center bg-purple-50 p-8 rounded-lg shadow-md"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-purple-600" />
            Get Started with Cricket!
          </h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
            Ready to dive into cricket? Grab a bat, join a local team, or watch a match to feel the excitement. With CricABC, you’re just one step away from becoming a cricket star!
            CricAbcSocial is coming soon, our social media platform where you can connect with cricket fans and share your passion for the game. Exclusive for cricket gossips!
          </p>
          <a
            href="#join-now"
            className="inline-block bg-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-purple-700 transition-colors"
          >
            Join the CricAbcSocial
          </a>
        </motion.section>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-purple-600 text-white py-12 text-center"
      >
        <p className="text-lg flex items-center justify-center gap-2">
          Now you know the ABCs of cricket! Grab a bat, call your friends, and play with joy!
          <MdSportsCricket className="inline-block w-6 h-6" />
        </p>
        <p className="mt-2 text-sm">Powered by CricABC</p>
      </motion.div>
    </div>
  );
};

export default KnowYourCricket;