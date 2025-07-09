import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GiCricketBat } from 'react-icons/gi';
import { FiSearch, FiCalendar, FiFilter, FiClock } from 'react-icons/fi';
import { type Match } from '../types/Match';

type MatchStatus = 'all' | 'upcoming' | 'live' | 'completed';
type MatchFormat = 'all' | 'TEST' | 'ODI' | 'T20' | 'T10' | 'WOMEN' | 'OTHER';

interface GroupedMatches {
  [key: string]: Match[];
}

export default function Schedules() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<MatchStatus>('all');
  const [formatFilter, setFormatFilter] = useState<MatchFormat>('all');

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        

        const response = await axios.get<Match[]>(
          `${import.meta.env.VITE_API_URL}/matches/schedules`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
          }
        );
        
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        // Ensure data is an array and validate each match
        const matchesData = Array.isArray(response.data) ? response.data : [response.data];
        
        // Process and validate matches
        const validMatches: Match[] = [];
        
        for (const match of matchesData) {
          try {
            // Skip invalid matches
            if (!match || typeof match !== 'object') {
              console.warn('Skipping invalid match data:', match);
              continue;
            }
            
            // Create a validated match object with defaults
            const validatedMatch: Match = {
              id: String(match.id || match.matchId || ''),
              matchId: String(match.matchId || ''),
              title: String(match.title || `${match.team1 || 'Team 1'} vs ${match.team2 || 'Team 2'}`),
              team1: String(match.team1 || 'Team 1'),
              team2: String(match.team2 || 'Team 2'),
              status: String(match.status || 'Upcoming'),
              dateTimeGMT: match.dateTimeGMT || null,
              matchStarted: Boolean(match.matchStarted),
              matchEnded: Boolean(match.matchEnded),
              venue: String(match.venue || 'TBD'),
              tournament: String(match.tournament || 'Cricket Match'),
              matchType: String(match.matchType || 'T20'),
              fantasyEnabled: Boolean(match.fantasyEnabled || false),
              bbbEnabled: Boolean(match.bbbEnabled || false),
              hasSquad: Boolean(match.hasSquad || false),
              fantasyLink: String(match.fantasyLink || ''),
              pointsTableLink: String(match.pointsTableLink || ''),
              scheduleLink: String(match.scheduleLink || '')
            };
            
            validMatches.push(validatedMatch);
          } catch (err) {
            console.error('Error processing match:', match, err);
          }
        }
        
        // Sort matches by date (newest first)
        const sortedMatches = [...validMatches].sort((a, b) => {
          try {
            const dateA = a.dateTimeGMT ? new Date(a.dateTimeGMT).getTime() : 0;
            const dateB = b.dateTimeGMT ? new Date(b.dateTimeGMT).getTime() : 0;
            return dateA - dateB;
          } catch (err) {
            // Error sorting matches
            return 0;
          }
        });
        
        if (sortedMatches.length === 0) {
          setError('No matches found. Please try again later.');
        } else {
          setMatches(sortedMatches);
        }
      } catch (err: any) {
        let errorMessage = 'Failed to load match schedules. ';
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += `Server responded with status ${err.response.status}: ${err.response.statusText}`;
          if (err.response.data) {
            console.error('Error response data:', err.response.data);
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage += 'No response received from server. Please check your internet connection.';
        } else {
          // Something happened in setting up the request
          errorMessage += `Error: ${err.message}`;
        }
        
        console.error('Error details:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter and group matches
  const { filteredMatches, matchDates } = useMemo(() => {
    let filtered = [...matches];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.team1.toLowerCase().includes(query) ||
          match.team2.toLowerCase().includes(query) ||
          match.venue.toLowerCase().includes(query) ||
          match.tournament.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((match) => {
        if (statusFilter === 'upcoming') return !match.matchStarted;
        if (statusFilter === 'live') return match.matchStarted && !match.matchEnded;
        if (statusFilter === 'completed') return match.matchEnded;
        return true;
      });
    }

    // Apply format filter
    if (formatFilter !== 'all') {
      filtered = filtered.filter((match) => {
        const matchType = match.matchType.toUpperCase();
        if (formatFilter === 'WOMEN') return matchType.includes('WOMEN');
        if (formatFilter === 'OTHER') return !['TEST', 'ODI', 'T20', 'T10'].some(f => matchType.includes(f));
        return matchType.includes(formatFilter);
      });
    }

    // Group matches by date
    const grouped: GroupedMatches = {};
    filtered.forEach((match) => {
      if (!match.dateTimeGMT) return;
      
      const date = new Date(match.dateTimeGMT);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });

    return {
      filteredMatches: grouped,
      matchDates: Object.keys(grouped).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      ),
    };
  }, [matches, searchQuery, statusFilter, formatFilter]);

  // Format match time
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  // Get match status
  const getMatchStatus = (match: Match) => {
    if (match.matchStarted && !match.matchEnded) return 'In Progress';
    if (match.matchEnded) return 'Completed';
    return 'Upcoming';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <GiCricketBat className="w-8 h-8 mr-3 text-purple-600" />
            <h1 className="text-4xl font-extrabold text-purple-900 sm:text-5xl lg:text-6xl">
              Match Schedules
            </h1>
          </div>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Stay updated with the latest cricket fixtures and match timings
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
              placeholder="Search matches by team, venue, or tournament..."
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <span className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200">
                <FiClock className="inline-block w-4 h-4 mr-1" /> Status
              </span>
              {(['all', 'upcoming', 'live', 'completed'] as MatchStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Format Filter */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <span className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200">
                <FiFilter className="inline-block w-4 h-4 mr-1" /> Format
              </span>
              {(['all', 'TEST', 'ODI', 'T20', 'T10', 'WOMEN', 'OTHER'] as MatchFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setFormatFilter(format)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    formatFilter === format
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading match schedules...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-red-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  console.log('Current matches state:', matches);
                  console.log('Current error state:', error);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Debug Info
              </button>
            </div>
          </div>
        )}

        {/* No Matches Found */}
        {!loading && !error && matchDates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <GiCricketBat className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No matches found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Matches List */}
        <AnimatePresence>
          {!loading && !error && matchDates.length > 0 && (
            <div className="space-y-8">
              {matchDates.map((date) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <FiCalendar className="w-5 h-5 text-purple-500 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-800">{date}</h2>
                      <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {filteredMatches[date].length} {filteredMatches[date].length === 1 ? 'Match' : 'Matches'}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredMatches[date].map((match) => (
                      <motion.div
                        key={match.matchId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getMatchStatus(match) === 'In Progress'
                              ? 'bg-red-100 text-red-800'
                              : getMatchStatus(match) === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getMatchStatus(match)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {match.dateTimeGMT && formatMatchTime(match.dateTimeGMT)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-4 py-2">
                          <div className="text-center">
                            <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-xl font-bold text-gray-700">{match.team1.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{match.team1}</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-700">VS</div>
                          <div className="text-center">
                            <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-xl font-bold text-gray-700">{match.team2.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{match.team2}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                            {match.matchType.toUpperCase()}
                          </span>
                          <p className="mt-1 text-xs text-gray-500">{match.venue}</p>
                          <p className="mt-1 text-xs font-medium text-purple-600">{match.tournament}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}