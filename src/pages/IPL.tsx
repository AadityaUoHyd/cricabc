import { useEffect, useState } from 'react'
import axios from 'axios'
import { initPusher } from '../lib/pusher'
import MatchCard from '../components/MatchCard'
import { motion, AnimatePresence } from 'framer-motion';
import iplLogo from '../assets/ipl_logo.png';
import { type Match } from '../types/Match'
import { FaCalendarAlt, FaNewspaper, FaTable, FaChartLine, FaUsers, FaInfoCircle } from 'react-icons/fa'

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  matchesPlayed: number;
  matchesWon: number;
  points: number;
  nrr: number;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
}

function IPL() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState({
    matches: true,
    teams: true,
    news: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch IPL matches
    const fetchData = async () => {
      try {
        // Fetch matches
        const matchesResponse = await axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/ipl`);
        setMatches(matchesResponse.data);
        
        // Fetch teams (mocked data - replace with actual API call)
        const teamsResponse = await axios.get<Team[]>(`${import.meta.env.VITE_API_URL}/teams/ipl`);
        const teamsWithStats = teamsResponse.data.map(team => ({
          ...team,
          matchesPlayed: Math.floor(Math.random() * 14) + 1,
          matchesWon: Math.floor(Math.random() * 10) + 1,
          points: Math.floor(Math.random() * 18) + 2,
          nrr: parseFloat((Math.random() * 2 - 1).toFixed(2))
        }));
        setTeams(teamsWithStats.sort((a, b) => b.points - a.points || b.nrr - a.nrr));
        
        // Mock news data (replace with actual API call)
        const mockNews: NewsItem[] = [
          {
            id: 1,
            title: 'IPL 2025 Auction Highlights',
            summary: 'Biggest buys and surprises from the IPL 2025 auction',
            imageUrl: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1621234567/ipl-auction.jpg',
            date: '2025-06-20'
          },
          {
            id: 2,
            title: 'New Format for IPL 2025',
            summary: 'IPL introduces exciting new format changes for the upcoming season',
            imageUrl: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1621234567/ipl-format.jpg',
            date: '2025-06-15'
          },
          {
            id: 3,
            title: 'Emerging Players to Watch',
            summary: '5 young talents who could shine in IPL 2025',
            imageUrl: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1621234567/young-talents.jpg',
            date: '2025-06-10'
          }
        ];
        setNews(mockNews);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch IPL data.');
        console.error(err);
      } finally {
        setIsLoading({
          matches: false,
          teams: false,
          news: false
        });
      }
    };

    fetchData();

    // Subscribe to Pusher updates
    const pusher = initPusher();
    const channel = pusher.subscribe('match-channel');
    channel.bind('match-update', (data: Match) => {
      if (data.tournament === 'IPL') {
        setMatches(prev => {
          const updated = prev.filter(m => m.matchId !== data.matchId);
          return [...updated, data];
        });
      }
    });

    return () => {
      pusher.unsubscribe('match-channel');
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-16 h-16 object-contain"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                      <p className="text-gray-600">
                        {team.matchesWon}W • {team.matchesPlayed - team.matchesWon}L • {team.points} pts
                      </p>
                      <p className="text-sm text-gray-500">NRR: {team.nrr}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'news':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.summary}</p>
                  <button className="mt-4 text-purple-600 hover:text-purple-800 font-medium">
                    Read More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'points':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Played</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NRR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-8 w-8 mr-2" src={team.logoUrl} alt={team.name} />
                        <span className="text-sm font-medium text-gray-900">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.matchesPlayed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.matchesWon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.matchesPlayed - team.matchesWon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.points}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${team.nrr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {team.nrr > 0 ? `+${team.nrr}` : team.nrr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Top Run Scorers</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 w-6 text-right">{i}.</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <p className="font-medium">Player {i}</p>
                        <p className="text-xs text-gray-500">Team {i}</p>
                      </div>
                    </div>
                    <span className="font-medium">{Math.floor(Math.random() * 300) + 200} runs</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Top Wicket Takers</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 w-6 text-right">{i}.</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(64 + i + 5)}
                      </div>
                      <div>
                        <p className="font-medium">Bowler {i}</p>
                        <p className="text-xs text-gray-500">Team {i + 5}</p>
                      </div>
                    </div>
                    <span className="font-medium">{Math.floor(Math.random() * 15) + 10} wickets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default: // matches
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Today's Match</h2>
              {matches.length > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <img src={teams[0]?.logoUrl} alt="Team 1" className="h-16 mx-auto mb-2" />
                    <p className="font-bold">{teams[0]?.name || 'Team A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">VS</p>
                    <p className="text-sm mt-2">7:30 PM IST</p>
                    <p className="text-xs mt-1">Wankhede Stadium, Mumbai</p>
                  </div>
                  <div className="text-center">
                    <img src={teams[1]?.logoUrl} alt="Team 2" className="h-16 mx-auto mb-2" />
                    <p className="font-bold">{teams[1]?.name || 'Team B'}</p>
                  </div>
                </div>
              ) : (
                <p>No matches scheduled for today</p>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Upcoming Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <MatchCard key={match.matchId} match={match} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No upcoming matches found</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <img 
                src={iplLogo}
                alt="IPL Logo" 
                className="h-24"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-500">Indian Premier League 2025</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              The most exciting T20 cricket league in the world. Catch all the live action, scores, and updates here.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {[
              { id: 'matches', label: 'Matches', icon: <FaCalendarAlt className="mr-2" /> },
              { id: 'teams', label: 'Teams', icon: <FaUsers className="mr-2" /> },
              { id: 'points', label: 'Points Table', icon: <FaTable className="mr-2" /> },
              { id: 'stats', label: 'Stats', icon: <FaChartLine className="mr-2" /> },
              { id: 'news', label: 'News', icon: <FaNewspaper className="mr-2" /> },
              { id: 'about', label: 'About', icon: <FaInfoCircle className="mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading.matches && activeTab === 'matches' ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default IPL;