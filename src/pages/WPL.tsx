import { useEffect, useState } from 'react';
import axios from 'axios';
import { initPusher } from '../lib/pusher';
import MatchCard from '../components/MatchCard';
import { motion, AnimatePresence } from 'framer-motion';
import WPLLogo from '../assets/wpl_logo.png';
import { type Match } from '../types/Match';
import { type Team } from '../types/Team';
import { type Player, type BattingStats, type BowlingStats } from '../types/Player';
import { usePlayers } from '../context/PlayerContext';
import { FaCalendarAlt, FaNewspaper, FaTable, FaChartLine, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { RiAuctionFill } from "react-icons/ri";
import { Trophy, Award } from 'lucide-react';
import WplAuction from './WplAuction';
import Papa from 'papaparse';
import wplAuctionData from '../utils/wpl-auction-data.csv?raw';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  publishedDate: string;
  slug?: string; // Optional slug field for SEO-friendly URLs
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

interface WinnerEntry {
  year: number;
  winner: string;
  runnerUp: string;
}

function WPL() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [topRunScorers, setTopRunScorers] = useState<Player[]>([]);
  const [topWicketTakers, setTopWicketTakers] = useState<Player[]>([]);
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [isLoading, setIsLoading] = useState({
    matches: true,
    teams: true,
    news: true,
    stats: true,
    winners: true,
  });
  const [error, setError] = useState<string | null>(null);

  let playersLoading = false;
  let playersError = null;
  try {
    const context = usePlayers();
    playersLoading = context.loading;
    playersError = context.error;
  } catch (err) {
    console.warn('PlayerContext not available:', err);
  }

  useEffect(() => {
    const fetchData = async () => {
      const loadingStates = {
        matches: true,
        teams: true,
        news: true,
        stats: true,
        winners: true,
      };

      try {
        // Fetch WPL matches
        const matchesPromise = axios.get<Match[]>(
          `${import.meta.env.VITE_API_URL}/matches/tournament/WPL`
        ).then(response => {
          setMatches(response.data);
          loadingStates.matches = false;
          setIsLoading(prev => ({ ...prev, matches: false }));
        }).catch(err => {
          console.error('Error fetching WPL matches:', err);
          setError(prev => prev || 'Failed to load matches.');
          loadingStates.matches = false;
          setIsLoading(prev => ({ ...prev, matches: false }));
        });

        // Fetch WPL teams
        const teamsPromise = axios.get<TeamsResponse>(
          `${import.meta.env.VITE_API_URL}/teams/wpl`,
          { params: { category: 'league', leagueName: "Women's Premier League (WPL)" } }
        ).then(response => {
          setTeams(response.data.content);
          loadingStates.teams = false;
          setIsLoading(prev => ({ ...prev, teams: false }));
        }).catch(err => {
          console.error('Error fetching WPL teams:', err);
          setError(prev => prev || 'Failed to load teams.');
          loadingStates.teams = false;
          setIsLoading(prev => ({ ...prev, teams: false }));
        });

        // Fetch points table
        const pointsPromise = axios.get<PointsTableEntry[]>(
          `${import.meta.env.VITE_API_URL}/points-table/wpl`
        ).then(response => {
          setPointsTable(response.data);
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        }).catch(err => {
          console.error('Error fetching WPL points table:', err);
          setError(prev => prev || 'Failed to load points table.');
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        });

        // Fetch news
        const newsPromise = axios.get<NewsItem[]>(
          `${import.meta.env.VITE_API_URL}/news`,
          { params: { tournament: 'WPL' } }
        ).then(response => {
          setNews(response.data);
          loadingStates.news = false;
          setIsLoading(prev => ({ ...prev, news: false }));
        }).catch(err => {
          console.error('Error fetching WPL news:', err);
          setError(prev => prev || 'Failed to load news.');
          loadingStates.news = false;
          setIsLoading(prev => ({ ...prev, news: false }));
        });

        // Fetch top players
        const playersPromise = axios.get<{ runScorers: Player[]; wicketTakers: Player[] }>(
          `${import.meta.env.VITE_API_URL}/players/stats/wpl`
        ).then(response => {
          setTopRunScorers(response.data.runScorers);
          setTopWicketTakers(response.data.wicketTakers);
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        }).catch(err => {
          console.error('Error fetching WPL player stats:', err);
          setError(prev => prev || 'Failed to load player statistics.');
          loadingStates.stats = false;
          setIsLoading(prev => ({ ...prev, stats: false }));
        });

        // Parse winners from CSV
        const winnersPromise = new Promise((resolve, reject) => {
          Papa.parse(wplAuctionData, {
            header: false,
            skipEmptyLines: true,
            transform: (value) => value.trim(),
            complete: (result) => {

              if (result.errors.length > 0) {
                console.warn('CSV parsing errors encountered:', result.errors);
              }

              const data = result.data as string[][];
              let currentSection: string | null = null;
              let currentHeaders: string[] = [];
              const winnersData: WinnerEntry[] = [];
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
                        winnersData.push({
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

              if (winnersData.length === 0 && winnersSectionFound) {
                console.warn('No valid winners data found in CSV.');
                setError('No valid winners data found. Please check the "# Winners" section in the CSV.');
              }

              setWinners(winnersData);
              loadingStates.winners = false;
              setIsLoading(prev => ({ ...prev, winners: false }));
              resolve(winnersData);
            },
            error: (err:any) => {
              console.error('Winners parse error:', err);
              setError('Failed to parse winners data.');
              loadingStates.winners = false;
              setIsLoading(prev => ({ ...prev, winners: false }));
              reject(err);
            },
          });
        });

        await Promise.allSettled([
          matchesPromise,
          teamsPromise,
          pointsPromise,
          newsPromise,
          playersPromise,
          winnersPromise,
        ]);

      } catch (err) {
        console.error('Unexpected error in WPL fetchData:', err);
        setError('An unexpected error occurred while loading WPL data.');
      } finally {
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
      if (data.tournament === 'WPL') {
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

  const navigateToTeamDetails = (teamId: string) => {
    window.location.href = `/team/${teamId}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, _index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigateToTeamDetails(team.id)}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64';
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-purple-600">{team.name}</h3>
                      <p className="text-gray-600">{team.country}</p>
                      <span className="text-sm text-purple-400 hover:text-purple-600 transition-colors">
                        View Details →
                      </span>
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
            {news.map((item, index) => {
              // Create a unique key using _id if available, otherwise use a combination of index and title
              const itemKey = item._id || `item-${index}-${item.title?.substring(0, 20).replace(/\s+/g, '-') || 'news'}`;
              
              // Function to handle news item click
              const handleNewsClick = () => {
                // Navigate to news detail page with the news item's slug
                // First, create a URL-friendly slug from the title if slug is not available
                const slug = item.slug || (item.title || '')
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-')      // Replace spaces with hyphens
                  .replace(/--+/g, '-');      // Replace multiple hyphens with single
                
                // Use React Router's navigate if available, otherwise use window.location
                if (typeof window !== 'undefined' && window.location) {
                  // Make sure to include the base URL if your app is not at the root
                  const baseUrl = window.location.origin;
                  window.location.href = `${baseUrl}/news/${slug}`;
                }
              };

              return (
                <motion.div
                  key={`news-${itemKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={handleNewsClick}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || 'News image'} 
                    className="w-full h-48 object-cover"
                    key={`img-${itemKey}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                    }}
                  />
                  <div 
                    className="p-4"
                    key={`content-${itemKey}`}
                  >
                    {item.publishedDate && (
                      <p 
                        className="text-sm text-gray-500 mb-2"
                        key={`date-${itemKey}`}
                      >
                        {new Date(item.publishedDate).toLocaleDateString()}
                      </p>
                    )}
                    <h3 
                      className="text-xl font-bold text-gray-800 mb-2"
                      key={`title-${itemKey}`}
                    >
                      {item.title || 'Untitled'}
                    </h3>
                    <div 
                      className="text-gray-600 news-content"
                      dangerouslySetInnerHTML={{ 
                        __html: item.content ? 
                          (item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content) 
                          : 'No content available' 
                      }} 
                    />
                    <button 
                      className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                      key={`btn-${itemKey}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent div's onClick
                        handleNewsClick();
                      }}
                    >
                      Read More →
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
                {isLoading.stats ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading points table...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : pointsTable.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No points table data available
                    </td>
                  </tr>
                ) : (
                  pointsTable.map((entry, index) => (
                    entry.team ? (
                      <tr key={entry.team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.team.logoUrl && (
                              <img 
                                className="h-8 w-8 mr-2" 
                                src={entry.team.logoUrl} 
                                alt={entry.team.name} 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {entry.team.name || `Team ${index + 1}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.matchesPlayed ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.matchesWon ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.matchesLost ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.points ?? '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          entry.nrr >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.nrr !== undefined ? 
                            (entry.nrr > 0 ? `+${entry.nrr.toFixed(2)}` : entry.nrr.toFixed(2)) : 
                            '-'}
                        </td>
                      </tr>
                    ) : null
                  ))
                )}
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
        return <WplAuction />;

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
              About WPL
            </h2>
            <div className="text-gray-600 mb-6">
              <p className="mb-4">The Women's Premier League (WPL), launched in 2023 by the Board of Control for Cricket in India (BCCI), is a professional Twenty20 cricket league in India, modeled after the Indian Premier League (IPL). It features five franchise-based teams representing Indian cities, showcasing top international and domestic women cricketers. The WPL succeeded the Women's T20 Challenge (2018–2022), providing a robust platform to elevate women's cricket. With a double round-robin format and playoffs, the league has grown in popularity, featuring high-energy matches and significant fan engagement, with the opening match of WPL 2025 attracting 30 million viewers.</p>
              <p className="mb-4">Backed by substantial investments, the WPL has a valuation of ₹1,350 crore ($162 million) in 2024, up 8% from ₹1,250 crore ($150 million) in 2023, driven by a ₹951 crore ($176 million) five-year media rights deal with Viacom18, translating to ₹7.09 crore per match, making it the second most valuable broadcast contract for a women's sports league globally, behind the WNBA. The Tata Group secured title sponsorship for ₹165 crore over five years, further bolstering the league's financial strength. The WPL continues to inspire the next generation of cricketers and promote gender equality in the sport.</p>
            </div>
            <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden m-6">
              <img
                src="src/assets/about-wpl.png"
                alt="Women's Premier League"
                className="w-full h-full object-cover p-4"
              />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              WPL Winners and Runners-Up (2023–2025)
            </h3>
            {winners.length === 0 ? (
              <p className="text-gray-500">No winners data available.</p>
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

      default:
        return (
          <div className="space-y-6">
            {matches.length > 0 && matches.some((m) => m.status === 'Live') ? (
              <div className="bg-gradient-to-r from-purple-400 to-indigo-800 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Live Match</h2>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <img
                      src={teams.find((t) => t.name === matches.find((m) => m.status === 'Live')?.team1)?.logoUrl}
                      alt="Team 1"
                      className="h-16 mx-auto mb-2"
                    />
                    <p className="font-bold">{matches.find((m) => m.status === 'Live')?.team1 || 'TBD'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">VS</p>
                    <p className="text-sm mt-2">{new Date(matches.find((m) => m.status === 'Live')?.dateTimeGMT || '').toLocaleString()}</p>
                    <p className="text-xs mt-1">
                      {(() => {
                        const liveMatch = matches.find((m) => m.status === 'Live');
                        if (!liveMatch) return '';
                        const venue = liveMatch.venue;
                        return typeof venue === 'string' 
                          ? venue 
                          : venue && 'stadiumName' in venue 
                            ? venue.stadiumName 
                            : '';
                      })()}
                    </p>
                  </div>
                  <div className="text-center">
                    <img
                      src={teams.find((t) => t.name === matches.find((m) => m.status === 'Live')?.team2)?.logoUrl}
                      alt="Team 2"
                      className="h-16 mx-auto mb-2"
                    />
                    <p className="font-bold">{matches.find((m) => m.status === 'Live')?.team2 || 'TBD'}</p>
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
                  .map((match, index) => (
                    <MatchCard 
                      key={`${match.matchId || 'match'}-${index}-${match.team1}-${match.team2}-${match.dateTimeGMT}`} 
                      match={match} 
                    />
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
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <img src={WPLLogo} alt="WPL Logo" className="h-24" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-500">Women's Premier League</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              The most exciting T20 cricket league in the world for women's cricket. Catch all the live action, scores, and updates here.
            </p>
          </motion.div>
        </div>
      </div>

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

      <div className="container mx-auto px-4 py-8">
        {(error || playersError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
            {(isLoading.matches || isLoading.teams || isLoading.news || isLoading.stats || isLoading.winners || playersLoading) && activeTab !== 'about' ? (
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

export default WPL;