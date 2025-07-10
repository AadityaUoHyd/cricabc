import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiAward, FiHash, FiChevronDown } from 'react-icons/fi';
import { type Match } from '../types/Match';

type MatchFormat = 'all' | 'TEST' | 'ODI' | 'T20' | 'T10' | 'WOMEN' | 'OTHER';
type TimePeriod = 'all' | '2025' | '2024' | '2023' | '2022' | '2021' | '2020' | '2019' | '2010s' | '2000s' | '1990s' | '1980s' | '1970s';

interface Tournament {
  id: string;
  name: string;
  logo: string;
}

const tournaments: Tournament[] = [
  { id: 'all', name: 'All Tournaments', logo: '🏆' },
  { id: 'icc', name: 'ICC Events', logo: '🌍' },
  { id: 'ipl', name: 'IPL', logo: '💎' },
  { id: 'bbl', name: 'Big Bash', logo: '🔥' },
  { id: 'cpl', name: 'CPL', logo: '☀️' },
  { id: 'wpl', name: 'WPL', logo: '🏏' },
];

export default function Archives() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<MatchFormat>('all');
  const [yearFilter, setYearFilter] = useState<TimePeriod>('all');
  const [tournamentFilter, setTournamentFilter] = useState<string>('all');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Fetch archived matches
  useEffect(() => {
    const fetchArchivedMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get<Match[]>(
          `${import.meta.env.VITE_API_URL}/matches/archives`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );

        if (response.data) {
          setMatches(response.data);
        } else {
          throw new Error('No data received from server');
        }
      } catch (err) {
        setError('Failed to load match archives. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedMatches();
  }, []);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    return matches
      .filter(match => {
        // Filter by search query
        const matchesSearch = 
          match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.team2.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by match format
        const matchesFormat = formatFilter === 'all' || match.matchType === formatFilter;
        
        // Filter by year
        let matchesYear = true;
        if (yearFilter !== 'all') {
          const matchYear = match.dateTimeGMT ? new Date(match.dateTimeGMT).getFullYear() : 0;
          if (yearFilter.endsWith('s')) {
            const decade = parseInt(yearFilter);
            matchesYear = matchYear >= decade && matchYear < decade + 10;
          } else {
            matchesYear = matchYear === parseInt(yearFilter);
          }
        }
        
        // Filter by tournament (simplified for example)
        const matchesTournament = tournamentFilter === 'all' || 
          match.tournament.toLowerCase().includes(tournamentFilter.toLowerCase());
        
        return matchesSearch && matchesFormat && matchesYear && matchesTournament;
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        const dateA = a.dateTimeGMT ? new Date(a.dateTimeGMT).getTime() : 0;
        const dateB = b.dateTimeGMT ? new Date(b.dateTimeGMT).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
  }, [matches, searchQuery, formatFilter, yearFilter, tournamentFilter]);

  // Toggle match details expansion
  const toggleExpandMatch = (matchId: string) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Match</span>
            <span className="block text-purple-600">Archives</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Relive the greatest moments in cricket history
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Format Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHash className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as MatchFormat)}
              >
                <option value="all">All Formats</option>
                <option value="TEST">Test</option>
                <option value="ODI">ODI</option>
                <option value="T20">T20</option>
                <option value="T10">T10</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value as TimePeriod)}
              >
                <option value="all">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2010s">2010-2019</option>
                <option value="2000s">2000-2009</option>
                <option value="1990s">1990-1999</option>
              </select>
            </div>

            {/* Tournament Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiAward className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
              >
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.logo} {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No matches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}

        {/* Matches Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredMatches.map((match) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {match.matchType}
                    </span>
                    <span className="text-sm text-gray-500">
                      {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleDateString() : 'Date TBD'}
                    </span>
                  </div>
                  
                  <div className="text-center mt-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                      {match.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{match.tournament}</p>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {match.team1}
                        </div>
                        <div className="text-sm text-gray-500">Team 1</div>
                      </div>
                      <div className="mx-4 text-2xl font-bold text-gray-500">VS</div>
                      <div className="flex-1 text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {match.team2}
                        </div>
                        <div className="text-sm text-gray-500">Team 2</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <FiClock className="mr-1" />
                      {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'}
                    </span>
                    <span className="text-sm text-gray-500">{match.venue}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {match.matchStarted ? (match.matchEnded ? 'Match Ended' : 'In Progress') : 'Upcoming'}
                    </span>
                    <button
                      onClick={() => toggleExpandMatch(match.matchId)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none flex items-center"
                    >
                      {expandedMatch === match.matchId ? 'Less details' : 'More details'}
                      <FiChevronDown 
                        className={`ml-1 h-4 w-4 transition-transform ${expandedMatch === match.matchId ? 'transform rotate-180' : ''}`} 
                      />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedMatch === match.matchId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Match Info</p>
                          <p className="text-gray-600">{match.tournament}</p>
                          <p className="text-gray-600">{match.venue}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Date & Time</p>
                          <p className="text-gray-600">
                            {match.dateTimeGMT 
                              ? new Date(match.dateTimeGMT).toLocaleString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'To be announced'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-4">
                          {match.fantasyLink && (
                            <a
                              href={match.fantasyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Fantasy
                            </a>
                          )}
                          {match.pointsTableLink && (
                            <a
                              href={match.pointsTableLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Points Table
                            </a>
                          )}
                          {match.scheduleLink && (
                            <a
                              href={match.scheduleLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Full Schedule
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
