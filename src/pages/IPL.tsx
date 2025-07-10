import { useEffect, useState } from 'react';
import axios from 'axios';
import { initPusher } from '../lib/pusher';
import MatchCard from '../components/MatchCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import iplLogo from '../assets/ipl_logo.png';
import { type Match } from '../types/Match';
import { type Team } from '../types/Team';
import { type Player, type BattingStats, type BowlingStats } from '../types/Player';
import { usePlayers } from '../context/PlayerContext';
import { FaCalendarAlt, FaNewspaper, FaTable, FaChartLine, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { RiAuctionFill } from "react-icons/ri";
import IplAuction from './IplAuction';
import Papa from 'papaparse';
import auctionData from '../utils/ipl-auction-data.csv?raw';

interface Winner {
  year: number;
  winner: string;
  runnerUp: string;
}

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  publishedDate: string;
}

interface TeamsResponse {
  content: Team[];
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
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState({
    matches: true,
    teams: true,
    news: true,
    stats: true,
    winners: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    'src/assets/about-ipl1.png',
    'src/assets/about-ipl2.png',
    'src/assets/about-ipl3.png',
    'src/assets/about-ipl4.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Player context with error handling
  let playersLoading = false;
  let playersError: string | null = null;
  try {
    const context = usePlayers();
    playersLoading = context.loading;
    playersError = context.error;
  } catch (err) {
    console.warn('PlayerContext not available:', err);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading({
        matches: true,
        teams: true,
        news: true,
        stats: true,
        winners: true,
      });

      try {
        // Fetch IPL matches
        const matchesPromise = axios
          .get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/tournament/IPL`)
          .then((response) => {
            setMatches(response.data);
            setIsLoading((prev) => ({ ...prev, matches: false }));
          })
          .catch((err) => {
            console.error('Error fetching matches:', err);
            setError((prev) => prev || 'Failed to load matches. Some data may be incomplete.');
            setIsLoading((prev) => ({ ...prev, matches: false }));
          });

        // Fetch IPL teams
        const teamsPromise = axios
          .get<TeamsResponse>(`${import.meta.env.VITE_API_URL}/teams/ipl`, {
            params: { category: 'league', leagueName: 'Indian Premier League (IPL)' },
          })
          .then((response) => {
            setTeams(response.data.content);
            setIsLoading((prev) => ({ ...prev, teams: false }));
          })
          .catch((err) => {
            console.error('Error fetching teams:', err);
            setError((prev) => prev || 'Failed to load teams. Some data may be incomplete.');
            setIsLoading((prev) => ({ ...prev, teams: false }));
          });

        // Fetch points table
        const pointsPromise = axios
          .get<PointsTableEntry[]>(`${import.meta.env.VITE_API_URL}/points-table/ipl`)
          .then((response) => {
            setPointsTable(response.data);
            setIsLoading((prev) => ({ ...prev, stats: false }));
          })
          .catch((err) => {
            console.error('Error fetching points table:', err);
            setError((prev) => prev || 'Failed to load points table. Some data may be incomplete.');
            setIsLoading((prev) => ({ ...prev, stats: false }));
          });

        // Fetch news
        const newsPromise = axios
          .get<NewsItem[]>(`${import.meta.env.VITE_API_URL}/news`, {
            params: { tournament: 'IPL' },
          })
          .then((response) => {
            setNews(response.data);
            setIsLoading((prev) => ({ ...prev, news: false }));
          })
          .catch((err) => {
            console.error('Error fetching news:', err);
            setError((prev) => prev || 'Failed to load news. Some data may be incomplete.');
            setIsLoading((prev) => ({ ...prev, news: false }));
          });

        // Fetch top players
        const playersPromise = axios
          .get<{ runScorers: Player[]; wicketTakers: Player[] }>(`${import.meta.env.VITE_API_URL}/players/stats/ipl`)
          .then((response) => {
            setTopRunScorers(response.data.runScorers);
            setTopWicketTakers(response.data.wicketTakers);
            setIsLoading((prev) => ({ ...prev, stats: false }));
          })
          .catch((err) => {
            console.error('Error fetching player stats:', err);
            setError((prev) => prev || 'Failed to load player statistics. Some data may be incomplete.');
            setIsLoading((prev) => ({ ...prev, stats: false }));
          });

        // Parse winners from CSV
        const parseWinnersData = () => {
          try {
            const parsed = Papa.parse(auctionData, {
              header: false,
              skipEmptyLines: true,
              transform: (value) => value.trim(),
            });

            if (parsed.errors.length > 0) {
              console.warn('CSV parsing errors encountered:', parsed.errors);
            }

            const data = parsed.data as string[][];
            let currentSection: string | null = null;
            let currentHeaders: string[] = [];
            const winners: Winner[] = [];
            let winnersSectionFound = false;

            for (let i = 0; i < data.length; i++) {
              const row = data[i];

              if (row.length === 1) {
                const sectionHeader = row[0].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
                if (sectionHeader === 'winners') {
                  currentSection = 'winners';
                  winnersSectionFound = true;
                  currentHeaders = [];
                  continue;
                } else if (['sold players', 'unsold players', 'team budgets'].includes(sectionHeader)) {
                  currentSection = null;
                  currentHeaders = [];
                  continue;
                } else {
                  console.warn(`Unknown section header at row ${i}: "${row[0]}"`);
                  continue;
                }
              }

              if (currentSection === 'winners' && currentHeaders.length === 0) {
                if (row.includes('year') && row.includes('winner') && row.includes('runnerUp')) {
                  currentHeaders = row;
                  continue;
                } else {
                  console.warn(`Expected winners headers at row ${i}, but got:`, row);
                }
              }

              if (currentSection === 'winners' && currentHeaders.length > 0) {
                if (row.length >= currentHeaders.length) {
                  const rowData = Object.fromEntries(currentHeaders.map((header, index) => [header, row[index] || '']));

                  if (rowData.year && rowData.winner && rowData.runnerUp) {
                    const year = parseInt(rowData.year);
                    if (!isNaN(year)) {
                      winners.push({
                        year,
                        winner: rowData.winner,
                        runnerUp: rowData.runnerUp,
                      });
                    } else {
                      console.warn(`Skipping winners row ${i} due to invalid year:`, rowData);
                    }
                  } else {
                    console.warn(`Skipping invalid winners row ${i}:`, rowData);
                  }
                } else {
                  console.warn(`Skipping row ${i} due to column mismatch in winners section (expected ${currentHeaders.length} columns, got ${row.length}):`, row);
                }
              }
            }

            if (!winnersSectionFound) {
              console.warn('Winners section not found in CSV.');
              setError('Winners section not found in CSV. Ensure the section header is "# Winners".');
            }

            if (winners.length === 0 && winnersSectionFound) {
              console.warn('No valid winners data found in CSV.');
              setError('No valid winners data found. Please check the "# Winners" section in the CSV.');
            }

            setWinners(winners);
            setIsLoading((prev) => ({ ...prev, winners: false }));
          } catch (err) {
            console.error('Error parsing winners data:', err);
            setError('Failed to load IPL winners data. Please verify the "# Winners" section in the CSV.');
            setIsLoading((prev) => ({ ...prev, winners: false }));
          }
        };

        parseWinnersData();

        await Promise.allSettled([matchesPromise, teamsPromise, pointsPromise, newsPromise, playersPromise]);
      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('An unexpected error occurred while loading IPL data. Please try again later.');
        setIsLoading({
          matches: false,
          teams: false,
          news: false,
          stats: false,
          winners: false,
        });
      }
    };

    fetchData();

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

      case 'auction':
        return <IplAuction />;

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
              The Indian Premier League (IPL), established in 2008 by the Board of Control for Cricket in India (BCCI), is a professional Twenty20 cricket league that has redefined global cricket. Held annually, it features ten franchise-based teams representing Indian cities and regions, attracting top international and domestic players. Renowned for its high-octane matches, massive fanbase, and unparalleled commercial success, the IPL is the world's second-largest sports league financially, valued at ₹92,500 crore ($11.1 billion) in 2024, trailing only the NFL. Its media rights for 2023–2027 were sold to Star India and Viacom18 for ₹48,390 crore ($8.9 billion), equating to ₹118 crore per match, the highest per-match value globally for any team sport.
              <p className="mt-2">
                The IPL has significantly bolstered the BCCI’s financial clout, contributing over 60% of its revenue, enabling investments in domestic cricket infrastructure and grassroots programs. The league has driven cricket’s growth by introducing innovations like the Decision Review System (DRS), strategic timeouts, and a vibrant blend of sport and entertainment, influencing T20 leagues worldwide. It has created opportunities for young talent, with players like Yashasvi Jaiswal and Umran Malik rising to prominence, and supports women’s cricket through initiatives like the WPL. The IPL’s viewership reached 510 million in 2024, with digital streaming on JioCinema hitting 2,600 crore minutes of watch time. Despite challenges like the 2013 spot-fixing scandal and relocations to South Africa (2009) and the UAE (2014, 2020), the IPL continues to thrive, fostering talent and delivering thrilling cricket that captivates a global audience.
              </p>
            </p>

            <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden mb-6">
              <motion.img
                key={images[currentImageIndex]}
                src={images[currentImageIndex]}
                alt={`IPL Highlight ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <button
                onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-purple-600' : 'bg-gray-400'}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600 mt-4" />
              IPL Winners and Runners-Up (2008–2025)
            </h3>
            {isLoading.winners ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : winners.length === 0 ? (
              <p className="text-gray-500 text-center">No winners data available.</p>
            ) : (
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
                    {winners.map((season, index) => (
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
            )}
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
              { id: 'auction', label: 'Auction', icon: <RiAuctionFill className="mr-2" /> },
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
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
            {(isLoading.matches || isLoading.teams || isLoading.news || isLoading.stats || isLoading.winners || playersLoading) &&
            activeTab !== 'auction' ? (
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