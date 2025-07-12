import { useEffect, useState } from 'react';
import axios from 'axios';
import { initPusher } from '../lib/pusher';
import MatchCard from '../components/MatchCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import iplLogo from '../assets/ipl_logo.png';
import { type Match } from '../types/Match';
import { type Team, type Venues } from '../types/Team';
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
  // Import images directly
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
        // Fetch IPL matches from backend
        const matchesPromise = axios
          .get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/tournament/IPL`)
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              // Transform the data to match the expected format
              const formattedMatches = response.data.map(match => {
                // Handle venue - it could be a string, object, or undefined
                let venue: string | Venues = 'TBD';
                if (match.venue) {
                  if (typeof match.venue === 'string') {
                    venue = match.venue;
                  } else if (match.venue && typeof match.venue === 'object') {
                    const venueObj = match.venue as Venues;
                    if ('stadiumName' in venueObj) {
                      venue = {
                        stadiumName: venueObj.stadiumName || 'Unknown Stadium',
                        city: venueObj.city || 'Unknown City',
                        country: venueObj.country || 'Unknown Country',
                        capacity: venueObj.capacity,
                        location: venueObj.location,
                        imageUrl: venueObj.imageUrl,
                        description: venueObj.description,
                        establishedYear: venueObj.establishedYear,
                        matchesHosted: venueObj.matchesHosted
                      };
                    }
                  }
                }
                
                const team1 = typeof match.team1 === 'string' ? match.team1 : 'TBD';
                const team2 = typeof match.team2 === 'string' ? match.team2 : 'TBD';
                
                return {
                  ...match,
                  team1,
                  team2,
                  dateTimeGMT: match.dateTimeGMT || new Date().toISOString(),
                  venue,
                  status: match.status || 'Scheduled',
                  matchStarted: match.matchStarted || false,
                  matchEnded: match.matchEnded || false,
                  id: match.id || match.matchId || `match-${Date.now()}`,
                  matchId: match.matchId || match.id || `match-${Date.now()}`,
                  title: match.title || `${team1} vs ${team2}`,
                  matchType: match.matchType || 'T20',
                  tournament: match.tournament || 'IPL',
                  fantasyEnabled: match.fantasyEnabled || false,
                  bbbEnabled: match.bbbEnabled || false,
                  hasSquad: match.hasSquad || false,
                  fantasyLink: match.fantasyLink || '',
                  pointsTableLink: match.pointsTableLink || '',
                  scheduleLink: match.scheduleLink || ''
                } as Match;
              });
              
              setMatches(formattedMatches);
              return formattedMatches;
            } else {
              setMatches([]);
              console.warn('Unexpected response format for IPL matches:', response.data);
              return [];
            }
          })
          .catch((err) => {
            console.error('Error fetching IPL matches:', err);
            setError('Failed to load IPL matches');
            setMatches([]);
            return [];
          }) as Promise<Match[]>;

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
          return new Promise<void>((resolve, reject) => {
            try {
              // Split the CSV into sections
              const sections = auctionData.split(/^#\s*(\w+.*?)$/gm);
              let winnersSection = '';
              let foundWinnersSection = false;

              // Find the Winners section
              for (let i = 0; i < sections.length; i++) {
                const section = sections[i].trim();
                if (section.toLowerCase() === 'winners') {
                  // The next section contains the winners data
                  if (i + 1 < sections.length) {
                    winnersSection = sections[i + 1].trim();
                    foundWinnersSection = true;
                  }
                  break;
                }
              }

              if (!foundWinnersSection) {
                console.warn('Winners section not found in CSV');
                setError('Winners section not found in CSV. Ensure the section header is "# Winners".');
                setIsLoading(prev => ({ ...prev, winners: false }));
                resolve();
                return;
              }

              // Parse the winners section
              Papa.parse(winnersSection, {
                header: true,
                skipEmptyLines: true,
                transform: (value) => value.trim(),
                complete: (result) => {
                  const winnersData: Winner[] = [];
                  
                  for (const row of result.data as any[]) {
                    if (row && row.year && row.winner && row.runnerUp) {
                      const year = parseInt(row.year);
                      if (!isNaN(year)) {
                        winnersData.push({
                          year,
                          winner: row.winner,
                          runnerUp: row.runnerUp,
                        });
                      } else {
                        console.warn('Skipping invalid year in winners data:', row);
                      }
                    }
                  }

                  if (winnersData.length === 0) {
                    console.warn('No valid winners data found in CSV');
                    setError('No valid winners data found. Please check the "# Winners" section in the CSV.');
                  } else {
                    // Sort winners by year in ascending order
                    winnersData.sort((a, b) => a.year - b.year);
                    // Removed debug log
                  }

                  setWinners(winnersData);
                  setIsLoading(prev => ({ ...prev, winners: false }));
                  resolve();
                },
                error: (err:any) => {
                  console.error('Error parsing winners section:', err);
                  setError('Failed to parse winners data.');
                  setIsLoading(prev => ({ ...prev, winners: false }));
                  reject(err);
                },
              });
            } catch (err) {
              console.error('Error in parseWinnersData:', err);
              setError('An error occurred while processing winners data.');
              setIsLoading(prev => ({ ...prev, winners: false }));
              reject(err);
            }
          });
        };

        // Execute all promises in parallel
        const results = await Promise.allSettled([
          matchesPromise,
          teamsPromise,
          pointsPromise,
          newsPromise,
          playersPromise,
          parseWinnersData()
        ]);

        // Log any errors for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error in promise ${index}:`, result.reason);
          }
        });

        // Ensure all loading states are set to false after all promises settle
        setIsLoading({
          matches: false,
          teams: false,
          news: false,
          stats: false,
          winners: false,
        });
      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('An unexpected error occurred while loading IPL data. Please try again later.');
        // Set all loading states to false in case of error
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
              // Create a unique key using _id if available, otherwise use index and a portion of the title
              const itemKey = item._id || `news-${index}-${item.title?.substring(0, 20).replace(/\s+/g, '-') || 'item'}`;
              
              // Safely handle potentially undefined or null values
              const title = item.title || 'No Title';
              const content = item.content ? 
                `${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}` : 
                'No content available';
              const date = item.publishedDate ? new Date(item.publishedDate).toLocaleDateString() : 'Date not available';
              const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
              
              // Function to handle news item click
              const handleNewsClick = () => {
                // Navigate to news detail page with the news item's slug
                // First, create a URL-friendly slug from the title if slug is not available
                const slug = item.slug || item.title
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
                  key={itemKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={handleNewsClick}
                >
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                    }}
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {date}
                    </p>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    <div 
                      className="text-gray-600" 
                      dangerouslySetInnerHTML={{ 
                        __html: content.replace(/<\/p>\s*<p>/g, ' ').replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                      }} 
                    />
                    <button 
                      className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
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
                      <tr key={entry.team?.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.team.logoUrl && (
                              <img 
                                className="h-8 w-8 mr-2" 
                                src={entry.team.logoUrl} 
                                alt={entry.team.name || `Team ${index + 1}`} 
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
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.nrr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

            <div className="text-gray-600 mb-6">
              The Indian Premier League (IPL), established in 2008 by the Board of Control for Cricket in India (BCCI), is a professional Twenty20 cricket league that has redefined global cricket. Held annually, it features ten franchise-based teams representing Indian cities and regions, attracting top international and domestic players. Renowned for its high-octane matches, massive fanbase, and unparalleled commercial success, the IPL is the world's second-largest sports league financially, valued at ₹92,500 crore ($11.1 billion) in 2024, trailing only the NFL. Its media rights for 2023–2027 were sold to Star India and Viacom18 for ₹48,390 crore ($8.9 billion), equating to ₹118 crore per match, the highest per-match value globally for any team sport.
              <div className="mt-2">
                The IPL has significantly bolstered the BCCI’s financial clout, contributing over 60% of its revenue, enabling investments in domestic cricket infrastructure and grassroots programs. The league has driven cricket’s growth by introducing innovations like the Decision Review System (DRS), strategic timeouts, and a vibrant blend of sport and entertainment, influencing T20 leagues worldwide. It has created opportunities for young talent, with players like Yashasvi Jaiswal and Umran Malik rising to prominence, and supports women’s cricket through initiatives like the WPL. The IPL’s viewership reached 510 million in 2024, with digital streaming on JioCinema hitting 2,600 crore minutes of watch time. Despite challenges like the 2013 spot-fixing scandal and relocations to South Africa (2009) and the UAE (2014, 2020), the IPL continues to thrive, fostering talent and delivering thrilling cricket that captivates a global audience.
              </div>
            </div>

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
              <Award className="w-6 h-6 mr-2 text-purple-600 " />
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
              (() => {
                const liveMatch = matches.find(m => m.status === 'Live');
                // Map of common team abbreviations to full names with alternative names
                const teamMappings: Record<string, string> = {
                  // Full names
                  'mumbai indians': 'Mumbai Indians',
                  'chennai super kings': 'Chennai Super Kings',
                  'royal challengers bengaluru': 'Royal Challengers Bengaluru',
                  'royal challengers bangalore': 'Royal Challengers Bengaluru',
                  'kolkata knight riders': 'Kolkata Knight Riders',
                  'sunrisers hyderabad': 'Sunrisers Hyderabad',
                  'delhi capitals': 'Delhi Capitals',
                  'delhi daredevils': 'Delhi Capitals',
                  'rajasthan royals': 'Rajasthan Royals',
                  'punjab kings': 'Punjab Kings',
                  'kings xi punjab': 'Punjab Kings',
                  'gujarat titans': 'Gujarat Titans',
                  'lucknow super giants': 'Lucknow Super Giants',
                  // Abbreviations
                  'mi': 'Mumbai Indians',
                  'csk': 'Chennai Super Kings',
                  'rcb': 'Royal Challengers Bengaluru',
                  'kkr': 'Kolkata Knight Riders',
                  'srh': 'Sunrisers Hyderabad',
                  'dc': 'Delhi Capitals',
                  'dd': 'Delhi Capitals',
                  'rr': 'Rajasthan Royals',
                  'pbks': 'Punjab Kings',
                  'kxip': 'Punjab Kings',
                  'gt': 'Gujarat Titans',
                  'lsg': 'Lucknow Super Giants',
                  // Common misspellings and variations
                  'mumbai': 'Mumbai Indians',
                  'chennai': 'Chennai Super Kings',
                  'bengaluru': 'Royal Challengers Bengaluru',
                  'bangalore': 'Royal Challengers Bengaluru',
                  'kolkata': 'Kolkata Knight Riders',
                  'hyderabad': 'Sunrisers Hyderabad',
                  'delhi': 'Delhi Capitals',
                  'rajasthan': 'Rajasthan Royals',
                  'punjab': 'Punjab Kings',
                  'gujarat': 'Gujarat Titans',
                  'lucknow': 'Lucknow Super Giants'
                };

                // Helper function to find team by name or abbreviation
                const findTeam = (teamName: string | undefined) => {
                  if (!teamName) return undefined;
                  
                  const lowerName = teamName.toLowerCase().trim();
                  
                  // Try direct mapping first
                  const mappedName = teamMappings[lowerName];
                  if (mappedName) {
                    return teams.find(t => t.name === mappedName);
                  }
                  
                  // Try exact match
                  let team = teams.find(t => t.name.toLowerCase() === lowerName);
                  if (team) return team;
                  
                  // Try short name match
                  if (teams.some(t => t.shortName && t.shortName.toLowerCase() === lowerName)) {
                    return teams.find(t => t.shortName && t.shortName.toLowerCase() === lowerName);
                  }
                  
                  // Try partial match with higher threshold
                  const partialMatches = teams.filter(t => 
                    t.name.toLowerCase().includes(lowerName) || 
                    (t.shortName && t.shortName.toLowerCase().includes(lowerName)) ||
                    lowerName.includes(t.name.toLowerCase())
                  );
                  
                  // If we have exactly one match with high confidence, return it
                  if (partialMatches.length === 1) {
                    return partialMatches[0];
                  }
                  
                  // If we have multiple matches, try to find the best one
                  if (partialMatches.length > 1) {
                    // Look for a team where the name is contained within the input
                    const containedMatch = partialMatches.find(t => 
                      lowerName.includes(t.name.toLowerCase()) ||
                      (t.shortName && lowerName.includes(t.shortName.toLowerCase()))
                    );
                    if (containedMatch) return containedMatch;
                    
                    // Otherwise return the first match
                    return partialMatches[0];
                  }
                  
                  // If no matches found, try to match by first letters of each word
                  const teamAbbr = lowerName.split(/\s+/)
                    .map(word => word[0])
                    .join('')
                    .toLowerCase();
                    
                  if (teamAbbr.length > 1) {
                    const abbrMatches = teams.filter(t => {
                      const tAbbr = t.name.split(/\s+/)
                        .map(w => w[0])
                        .join('')
                        .toLowerCase();
                      return tAbbr === teamAbbr || 
                             (t.shortName && t.shortName.toLowerCase() === teamAbbr);
                    });
                    
                    if (abbrMatches.length === 1) {
                      return abbrMatches[0];
                    }
                  }
                  
                  return undefined;
                };

                // Get team names, handling both string and object formats
                const getTeamName = (team: string | Team | undefined): string => {
                  if (!team) return 'TBD';
                  if (typeof team === 'string') return team;
                  return team.name || 'TBD';
                };
                
                const team1Name = getTeamName(liveMatch?.team1);
                const team2Name = getTeamName(liveMatch?.team2);
                
                // Find team objects
                const team1 = findTeam(team1Name);
                const team2 = findTeam(team2Name);
                
                // Debug logging in development only - removed

                // Helper to get venue name
                const getVenueName = (venue: Match['venue'] | undefined): string => {
                  if (!venue) return 'TBD';
                  if (typeof venue === 'string') return venue;
                  
                  // Safely access stadiumName or any other property
                  const venueObj = venue as any;
                  return venueObj.stadiumName || venueObj.name || 'TBD';
                };

                // Helper to get team logo
                const TeamLogo = ({ team, name }: { team?: Team; name: string }) => {
                  const logoUrl = team?.logoUrl;
                  const displayName = team?.name || name || 'TBD';
                  
                  return (
                    <div className="text-center">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={displayName}
                          className="h-16 mx-auto mb-2 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.team-logo-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-2 items-center justify-center team-logo-fallback"
                        style={{ display: logoUrl ? 'none' : 'flex' }}
                      >
                        <span className="text-xs text-gray-500">{displayName.split(' ').map(w => w[0]).join('')}</span>
                      </div>
                      <p className="font-bold">{displayName}</p>
                    </div>
                  );
                };

                return (
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-800 text-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">Live Match</h2>
                    <div className="flex items-center justify-between">
                      <TeamLogo team={team1} name={team1Name} />
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold">VS</p>
                        <p className="text-sm mt-2">
                          {liveMatch?.dateTimeGMT 
                            ? new Date(liveMatch.dateTimeGMT).toLocaleString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'TBD'}
                        </p>
                        <p className="text-xs mt-1">
                          {getVenueName(liveMatch?.venue)}
                        </p>
                        {liveMatch?.status && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-500 rounded-full animate-pulse">
                            {liveMatch.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <TeamLogo team={team2} name={team2Name} />
                    </div>
                  </div>
                );
              })()
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
            {(isLoading.matches && activeTab === 'matches') ||
             (isLoading.teams && activeTab === 'teams') ||
             (isLoading.news && activeTab === 'news') ||
             (isLoading.stats && activeTab === 'stats') ||
             (isLoading.winners && activeTab === 'about') ||
             (playersLoading && (activeTab === 'stats' || activeTab === 'matches')) ? (
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