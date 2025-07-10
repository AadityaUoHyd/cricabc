import { useEffect, useState } from 'react';
import axios from 'axios';
import { initPusher } from '../lib/pusher';
import MatchCard from '../components/MatchCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import iplLogo from '../assets/ipl_logo.png';
import { type Match } from '../types/Match';
import {type Team } from '../types/Team';
import { type Player, type BattingStats, type BowlingStats } from '../types/Player';
import { usePlayers } from '../context/PlayerContext';
import { FaCalendarAlt, FaNewspaper, FaTable, FaChartLine, FaUsers, FaInfoCircle } from 'react-icons/fa';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  publishedDate: string;
}

interface TeamsResponse {
  content: Team[];
  // Add other pagination properties if they exist in the response
  // For example: page, size, totalElements, totalPages, etc.
}

interface PointsTableEntry {
  team: Team;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  points: number;
  nrr: number;
}

function IPL() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [topRunScorers, setTopRunScorers] = useState<Player[]>([]);
  const [topWicketTakers, setTopWicketTakers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState({
    matches: true,
    teams: true,
    news: true,
    stats: true,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Safely get player context with error handling
  let playersLoading = false;
  let playersError = null;
  try {
    const context = usePlayers();
    playersLoading = context.loading;
    playersError = context.error;
  } catch (err) {
    console.warn('PlayerContext not available:', err);
    // Continue without player data if context is not available
  }

  useEffect(() => {
    const fetchData = async () => {
      const loadingStates = {
        matches: true,
        teams: true,
        news: true,
        stats: true,
      };

      try {
        // Fetch IPL matches
        const matchesPromise = axios.get<Match[]>(
          `${import.meta.env.VITE_API_URL}/matches/tournament/IPL`
        ).then(response => {
          setMatches(response.data);
          loadingStates.matches = false;
          setIsLoading(prev => ({ ...prev, matches: false }));
        }).catch(err => {
          console.error('Error fetching matches:', err);
          setError(prev => prev || 'Failed to load matches. Some data may be incomplete.');
          loadingStates.matches = false;
          setIsLoading(prev => ({ ...prev, matches: false }));
        });

        // Fetch IPL teams
        const teamsPromise = axios.get<TeamsResponse>(
          `${import.meta.env.VITE_API_URL}/teams/ipl`,
          { params: { category: 'league', leagueName: 'Indian Premier League (IPL)' } }
        ).then(response => {
          setTeams(response.data.content);
          loadingStates.teams = false;
          setIsLoading(prev => ({ ...prev, teams: false }));
        }).catch(err => {
          console.error('Error fetching teams:', err);
          setError(prev => prev || 'Failed to load teams. Some data may be incomplete.');
          loadingStates.teams = false;
          setIsLoading(prev => ({ ...prev, teams: false }));
        });

        // Fetch points table
        const pointsPromise = axios.get<PointsTableEntry[]>(
          `${import.meta.env.VITE_API_URL}/points-table/ipl`
        ).then(response => {
          setPointsTable(response.data);
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        }).catch(err => {
          console.error('Error fetching points table:', err);
          setError(prev => prev || 'Failed to load points table. Some data may be incomplete.');
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        });

        // Fetch news
        const newsPromise = axios.get<NewsItem[]>(
          `${import.meta.env.VITE_API_URL}/news`,
          { params: { tournament: 'IPL' } }
        ).then(response => {
          setNews(response.data);
          loadingStates.news = false;
          setIsLoading(prev => ({ ...prev, news: false }));
        }).catch(err => {
          console.error('Error fetching news:', err);
          setError(prev => prev || 'Failed to load news. Some data may be incomplete.');
          loadingStates.news = false;
          setIsLoading(prev => ({ ...prev, news: false }));
        });

        // Fetch top players
        const playersPromise = axios.get<{ runScorers: Player[]; wicketTakers: Player[] }>(
          `${import.meta.env.VITE_API_URL}/players/stats/ipl`
        ).then(response => {
          setTopRunScorers(response.data.runScorers);
          setTopWicketTakers(response.data.wicketTakers);
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        }).catch(err => {
          console.error('Error fetching player stats:', err);
          setError(prev => prev || 'Failed to load player statistics. Some data may be incomplete.');
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        });

        // Wait for all requests to complete
        await Promise.allSettled([
          matchesPromise,
          teamsPromise,
          pointsPromise,
          newsPromise,
          playersPromise
        ]);

      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('An unexpected error occurred while loading IPL data. Please try again later.');
      } finally {
        // Ensure all loading states are set to false
        setIsLoading({
          matches: false,
          teams: false,
          news: false,
          stats: false,
        });
      }
    };

    fetchData();

    // Subscribe to Pusher updates
    const pusher = initPusher();
    const channel = pusher.subscribe('match-channel');
    channel.bind('match-update', (data: Match) => {
      if (data.tournament === 'IPL') {
        setMatches((prev) => {
          const updated = prev.filter((m) => m.matchId !== data.matchId);
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
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <img src={team.logoUrl} alt={team.name} className="w-16 h-16 object-contain" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-500">{team.name}</h3>
                      <p className="text-gray-600">{team.country}</p>
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
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(item.publishedDate).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: item.content.substring(0, 100) + '...' }} />
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
              <thead className="bg-purple-500">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Played</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Won</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NRR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pointsTable.map((entry, index) => (
                  <tr key={entry.team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-8 w-8 mr-2" src={entry.team.logoUrl} alt={entry.team.name} />
                        <span className="text-sm font-medium text-gray-900">{entry.team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.matchesPlayed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.matchesWon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.matchesLost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.points}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.nrr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.nrr > 0 ? `+${entry.nrr.toFixed(2)}` : entry.nrr.toFixed(2)}
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
                {topRunScorers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                      <img src={player.photoUrl} alt={player.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-gray-500">{player.leagues?.[0] || 'Unknown Team'}</p>
                      </div>
                    </div>
                    <span className="font-medium">{(player.iplStats?.batting as BattingStats)?.runs || 0} runs</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Top Wicket Takers</h3>
              <div className="space-y-4">
                {topWicketTakers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                      <img src={player.photoUrl} alt={player.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-gray-500">{player.leagues?.[0] || 'Unknown Team'}</p>
                      </div>
                    </div>
                    <span className="font-medium">{(player.iplStats?.bowling as BowlingStats)?.wickets || 0} wickets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'about':
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <Trophy className="w-6 h-6 mr-2 text-purple-600" />
        About IPL
      </h2>
      <p className="text-gray-600 mb-6">
        The Indian Premier League (IPL), established in 2008 by the Board of Control for Cricket in India (BCCI), is a professional Twenty20 cricket league that has transformed the sport's global landscape. Held annually, it features franchise-based teams representing Indian cities and regions, attracting top international and domestic players. Known for its high-octane matches, massive fanbase, and significant commercial success, the IPL is one of the world's most popular cricket leagues. Over the years, it has introduced innovations like the Decision Review System (DRS), strategic timeouts, and a vibrant mix of cricket and entertainment, influencing other T20 leagues worldwide. The league has grown from eight teams to ten, with expansions in 2011 and 2022, and has faced challenges like the 2008 spot-fixing scandal and temporary relocations to South Africa (2009) and the UAE (2014, 2020) due to logistical issues. Despite these, the IPL continues to thrive, fostering new talent and delivering thrilling cricket.
      </p>
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <Award className="w-6 h-6 mr-2 text-purple-600" />
        IPL Winners and Runners-Up (2008–2025)
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Winner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Runner-Up</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { year: 2008, winner: 'Rajasthan Royals', runnerUp: 'Chennai Super Kings' },
              { year: 2009, winner: 'Deccan Chargers', runnerUp: 'Royal Challengers Bangalore' },
              { year: 2010, winner: 'Chennai Super Kings', runnerUp: 'Mumbai Indians' },
              { year: 2011, winner: 'Chennai Super Kings', runnerUp: 'Royal Challengers Bangalore' },
              { year: 2012, winner: 'Kolkata Knight Riders', runnerUp: 'Chennai Super Kings' },
              { year: 2013, winner: 'Mumbai Indians', runnerUp: 'Chennai Super Kings' },
              { year: 2014, winner: 'Kolkata Knight Riders', runnerUp: 'Kings XI Punjab' },
              { year: 2015, winner: 'Mumbai Indians', runnerUp: 'Chennai Super Kings' },
              { year: 2016, winner: 'Sunrisers Hyderabad', runnerUp: 'Royal Challengers Bangalore' },
              { year: 2017, winner: 'Mumbai Indians', runnerUp: 'Rising Pune Supergiant' },
              { year: 2018, winner: 'Chennai Super Kings', runnerUp: 'Sunrisers Hyderabad' },
              { year: 2019, winner: 'Mumbai Indians', runnerUp: 'Chennai Super Kings' },
              { year: 2020, winner: 'Mumbai Indians', runnerUp: 'Delhi Capitals' },
              { year: 2021, winner: 'Chennai Super Kings', runnerUp: 'Kolkata Knight Riders' },
              { year: 2022, winner: 'Gujarat Titans', runnerUp: 'Rajasthan Royals' },
              { year: 2023, winner: 'Chennai Super Kings', runnerUp: 'Gujarat Titans' },
              { year: 2024, winner: 'Kolkata Knight Riders', runnerUp: 'Sunrisers Hyderabad' },
              { year: 2025, winner: 'Royal Challengers Bangalore', runnerUp: 'Punjab Kings' },
            ].map((season, index) => (
              <motion.tr
                key={season.year}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{season.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.winner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.runnerUp}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

      default: // matches
        return (
          <div className="space-y-6">
            {matches.length > 0 && matches.some((m) => m.status === 'Live') ? (
              <div className="bg-gradient-to-r from-purple-400 to-indigo-800 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Live Match</h2>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <img
                      src={teams.find((t) => t.id === matches.find((m) => m.status === 'Live')?.team1)?.logoUrl}
                      alt="Team 1"
                      className="h-16 mx-auto mb-2"
                    />
                    <p className="font-bold">{teams.find((t) => t.id === matches.find((m) => m.status === 'Live')?.team1)?.name || 'TBD'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">VS</p>
                    <p className="text-sm mt-2">{new Date(matches.find((m) => m.status === 'Live')?.dateTimeGMT || '').toLocaleString()}</p>
                    <p className="text-xs mt-1">{matches.find((m) => m.status === 'Live')?.venue}</p>
                  </div>
                  <div className="text-center">
                    <img
                      src={teams.find((t) => t.id === matches.find((m) => m.status === 'Live')?.team2)?.logoUrl}
                      alt="Team 2"
                      className="h-16 mx-auto mb-2"
                    />
                    <p className="font-bold">{teams.find((t) => t.id === matches.find((m) => m.status === 'Live')?.team2)?.name || 'TBD'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>No live matches currently</p>
            )}

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Upcoming Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.length > 0 ? (
                matches
                  .filter((match) => match.status !== 'Live')
                  .map((match) => <MatchCard key={match.matchId} match={match} />)
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
              <img src={iplLogo} alt="IPL Logo" className="h-24" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-500">Indian Premier League</h1>
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
        {(error || playersError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || playersError}</p>
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
            {(isLoading.matches || isLoading.teams || isLoading.news || isLoading.stats || playersLoading) && activeTab !== 'about' ? (
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
  );
}

export default IPL;