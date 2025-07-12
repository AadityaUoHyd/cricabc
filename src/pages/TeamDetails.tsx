import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Player } from '../types/Player';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, MapPin, Shield, Star, Trophy, Users } from 'lucide-react';
import { FaChevronRight } from 'react-icons/fa';
import { Button } from '../components/ui/button';

interface TeamsResponse {
  content: TeamDetails[];
  totalPages: number;
  totalElements: number;
}

interface ErrorState {
  message: string;
  status?: number;
}

interface TeamRanking {
  testRank?: number;
  odiRank?: number;
  t20Rank?: number;
  testRating?: number;
  odiRating?: number;
  t20Rating?: number;
}

interface TeamDetails {
  id: string;
  name: string;
  category: 'international' | 'domestic' | 'league';
  internationalTeamType?: 'full member' | 'associate member';
  leagueName?: string;
  domesticTournamentName?: string;
  country: string;
  gender: 'male' | 'female' | string;
  logoUrl: string;
  teamRanking?: TeamRanking;
  governingBody: string;
  headquarters: string;
  teamImageUrl: string;
  majorTitles?: string[];
  foundedYear?: number;
  teamStats?: TeamStats;
  shortName?: string;
  teamLeadership?: TeamLeadership;
  homeVenueIds?: string[];
  venues?: Venue[];
}

interface TeamStats {
  totalTestMatches?: number;
  totalODIMatches?: number;
  totalT20Matches?: number;
  totalTestDraws?: number;
  totalODIDraws?: number;
  totalT20Draws?: number;
  totalTestTies?: number;
  totalODITies?: number;
  totalT20Ties?: number;
  totalTestWins?: number;
  totalODIWins?: number;
  totalT20Wins?: number;
  totalTestLosses?: number;
  totalODILosses?: number;
  totalT20Losses?: number;
  percentageTestWin?: number | undefined;
  percentageODIWin?: number | undefined;
  percentageT20Win?: number | undefined;
  highestTestScore?: number | string | null;
  highestODIScore?: number | string | null;
  highestT20Score?: number | string | null;
  lowestTestScore?: number | string | null;
  lowestODIScore?: number | string | null;
  lowestT20Score?: number | string | null;
}

interface TeamLeadership {
  testCaptain?: string;
  odiCaptain?: string;
  ttwentyInternationalsCaptain?: string;
  firstClassCaptain?: string;
  listACaptain?: string;
  twenty20Captain?: string;
  testHeadCoach?: string;
  odiHeadCoach?: string;
  ttwentyInternationalsHeadCoach?: string;
  firstClassHeadCoach?: string;
  listAHeadCoach?: string;
  twenty20HeadCoach?: string;
  coachingStaff?: { [key: string]: string };
}

interface Venue {
  id: string;
  stadiumName: string;
  city: string;
  country: string;
  capacity?: number;
  location?: string;
  imageUrl?: string;
  description?: string;
  establishedYear?: number;
  matchesHosted?: number;
}

const TeamDetails = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);

  

  // Filter players based on team membership
  const currentPlayers = useMemo(() => {
    if (!team?.name) return [];

    return allPlayers.filter((player: Player) => {
      if (!player) return false;

      const checkTeamMembership = (teams: (string | { name?: string } | undefined)[] = []) => {
        return teams.some((t) => {
          if (!t) return false;
          const teamName = typeof t === 'string' ? t : t.name || '';
          return teamName.includes('*') && teamName.replace(/\*/g, '') === team.name;
        });
      };

      const isInternationalPlayer = checkTeamMembership(player.internationalTeams);
      const isDomesticPlayer = checkTeamMembership(player.domesticTeams);
      const isLeaguePlayer = checkTeamMembership(player.leagues);

      return isInternationalPlayer || isDomesticPlayer || isLeaguePlayer;
    });
  }, [allPlayers, team]);

  // Helper function to search for a team by name
  const searchTeamByName = useCallback(async (searchTerm: string) => {
    try {
      // Remove the _id suffix if it exists
      let cleanSearchTerm = searchTerm.endsWith('_id') ? searchTerm.slice(0, -3) : searchTerm;
      // Replace underscores and hyphens with spaces for better search
      cleanSearchTerm = cleanSearchTerm.replace(/[_-]/g, ' ');

      // Search for teams by name
      const searchRes = await axios.get<TeamsResponse>(
        `${import.meta.env.VITE_API_URL}/teams/search`,
        { params: { name: cleanSearchTerm } }
      );

      if (searchRes?.data?.content?.length > 0) {
        // If we found a team, use the first result
        const teamRes = await axios.get<TeamDetails>(
          `${import.meta.env.VITE_API_URL}/teams/${searchRes.data.content[0].id}`
        );
        
        // Fetch players for the found team
        const playersRes = await axios.get<Player[]>(
          `${import.meta.env.VITE_API_URL}/players`
        );
        
        setTeam(teamRes.data);
        setAllPlayers(playersRes.data);
        setError(null);
      } else {
        setError({
          message: `No team found with name "${searchTerm}"`,
          status: 404
        });
      }
    } catch (err: any) {
      console.error('Error in searchTeamByName:', err);
      setError({
        message: err.response?.data?.message || 'Failed to search for team',
        status: err.response?.status || 500
      });
    }
  }, []);

  const fetchTeamDetails = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      // First try direct lookup by ID (for all ID types)
      try {
        const teamRes = await axios.get<TeamDetails>(`${import.meta.env.VITE_API_URL}/teams/${teamId}`);
        
        // If direct lookup succeeds, fetch players and update state
        if (teamRes?.data) {
          const playersRes = await axios.get<Player[]>(`${import.meta.env.VITE_API_URL}/players`);
          setTeam(teamRes.data);
          setAllPlayers(playersRes.data);
          setError(null);
          return;
        }
      } catch (err) {
        // If direct lookup fails, try searching by name
        console.debug('Direct lookup failed, trying search by name');
      }

      // If we get here, either direct lookup failed or returned no data
      // Try searching by name as a fallback
      await searchTeamByName(teamId);
    } catch (err: any) {
      console.error('Error fetching team details:', err);
      setError({
        message: 'Failed to load team details',
        status: 500
      });
    } finally {
      setLoading(false);
    }
  }, [teamId, searchTeamByName]);

  // Fetch team details when component mounts or teamId changes
  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  const handlePlayerClick = useCallback((playerId: string) => {
    navigate(`/players/${playerId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Team</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate('/teams')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Browse All Teams
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Team Not Found</h2>
          <p className="text-gray-600 mb-6">The requested team could not be found.</p>
          <Button
            onClick={() => navigate('/teams')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {team.teamImageUrl ? (
          <div className="w-full aspect-[16/9] overflow-hidden">
            
        
            {team.teamImageUrl ? (
              <img
                src={team.teamImageUrl}
                alt={`${team.name} hero`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a simple purple background if image fails to load
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDEyODAgNzIwIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGk0Y2ZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzQwM2M0ZSI+CiAgICBObyBUZWFtIEltYWdlIEF2YWlsYWJsZQogIDwvdGV4dD4KPC9zdmc+';
                }}
              />
            ) : (
              <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-lg font-medium">No Team Image Available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
              <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  {team.logoUrl && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-2 rounded-xl shadow-lg"
                    >
                      <img
                        src={team.logoUrl}
                        alt={`${team.name} logo`}
                        className="h-20 w-20 md:h-28 md:w-28 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1752302971/ff_nybtqf.jpg';
                        }}
                      />
                    </motion.div>
                  )}
                  <div className="text-white">
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-5xl font-bold mb-4"
                    >
                      {team.name}
                    </motion.h1>
                    <div className="flex flex-wrap gap-3 text-sm md:text-base">
                      <motion.span
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                      >
                        <MapPin className="h-4 w-4" />
                        {team.country}
                      </motion.span>
                      <motion.span
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                      >
                        <Shield className="h-4 w-4" />
                        {team.category}
                      </motion.span>
                      {team.internationalTeamType && (
                        <motion.span
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                        >
                          <Award className="h-4 w-4" />
                          {team.internationalTeamType}
                        </motion.span>
                      )}
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(-1)}
                          className="text-purple-600 hover:bg-purple-50 flex items-center gap-2 text-sm font-medium"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Teams
                        </Button>
                    </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-600 to-purple-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {team.logoUrl && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-2 rounded-xl shadow-lg"
                  >
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="h-24 w-24 md:h-32 md:w-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1752302971/ff_nybtqf.jpg';
                      }}
                    />
                  </motion.div>
                )}
                <div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-5xl font-bold mb-4"
                  >
                    {team.name}
                  </motion.h1>
                  <div className="flex flex-wrap gap-3 text-sm md:text-base">
                    <motion.span
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                    >
                      <MapPin className="h-4 w-4" />
                      {team.country}
                    </motion.span>
                    <motion.span
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                    >
                      <Shield className="h-4 w-4" />
                      {team.category}
                    </motion.span>
                    {team.internationalTeamType && (
                      <motion.span
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                      >
                        <Award className="h-4 w-4" />
                        {team.internationalTeamType}
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About Team */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                About {team.name}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Governing Body</h3>
                    <p className="mt-1 text-gray-900">{team.governingBody || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Headquarters</h3>
                    <p className="mt-1 text-gray-900">{team.headquarters || 'N/A'}</p>
                  </div>
                  {team.foundedYear && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Founded</h3>
                      <p className="mt-1 text-gray-900">{team.foundedYear}</p>
                    </div>
                  )}
                  {team.internationalTeamType && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">ICC Status</h3>
                      <p className="mt-1 text-gray-900 capitalize">{team.internationalTeamType}</p>
                    </div>
                  )}
                </div>
                {team.majorTitles && team.majorTitles.length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Major Titles
                    </h3>
                    <ul className="space-y-2">
                      {team.majorTitles.map((title: string, index: number) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <Star className="h-4 w-4 text-purple-500" />
                          {title}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats, Leadership, Venues */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-purple-600" />
                Team Statistics
              </h2>
              <div className="space-y-6">
                {team.teamStats && team.teamStats.percentageTestWin !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Win Percentages</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">Test</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.percentageTestWin ? `${team.teamStats.percentageTestWin}%` : 'N/A'}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">ODI</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.percentageODIWin ? `${team.teamStats.percentageODIWin}%` : 'N/A'}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">T20I</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.percentageT20Win ? `${team.teamStats.percentageT20Win}%` : 'N/A'}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                )}
                {team.teamStats && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Highest Team Score</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">Test</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.highestTestScore || 'N/A'}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">ODI</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.highestODIScore || 'N/A'}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm text-gray-500">T20I</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {team.teamStats.highestT20Score ? String(team.teamStats.highestT20Score) : 'N/A'}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Team Leadership */}
            {team.teamLeadership && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Team Leadership
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(team.teamLeadership.testCaptain || team.teamLeadership.odiCaptain || team.teamLeadership.ttwentyInternationalsCaptain) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Captains</h3>
                      <div className="space-y-2">
                        {team.teamLeadership.testCaptain && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Test:</span> {team.teamLeadership.testCaptain}
                          </p>
                        )}
                        {team.teamLeadership.odiCaptain && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">ODI:</span> {team.teamLeadership.odiCaptain}
                          </p>
                        )}
                        {team.teamLeadership.ttwentyInternationalsCaptain && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">T20I:</span> {team.teamLeadership.ttwentyInternationalsCaptain}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {(team.teamLeadership.testHeadCoach || team.teamLeadership.odiHeadCoach || team.teamLeadership.ttwentyInternationalsHeadCoach) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Coaches</h3>
                      <div className="space-y-2">
                        {team.teamLeadership.testHeadCoach && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Test:</span> {team.teamLeadership.testHeadCoach}
                          </p>
                        )}
                        {team.teamLeadership.odiHeadCoach && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">ODI:</span> {team.teamLeadership.odiHeadCoach}
                          </p>
                        )}
                        {team.teamLeadership.ttwentyInternationalsHeadCoach && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">T20I:</span> {team.teamLeadership.ttwentyInternationalsHeadCoach}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Home Venues */}
            {team.venues && team.venues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  Home Venues
                </h2>
                <div className="space-y-4">
                  {team.venues.map((venue) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <h3 className="font-medium text-gray-900">{venue.stadiumName}</h3>
                      <p className="text-sm text-gray-600">{venue.city}, {venue.country}</p>
                      {venue.capacity && (
                        <p className="text-xs text-gray-500 mt-1">Capacity: {venue.capacity.toLocaleString()}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Current Squad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:sticky lg:top-20 h-fit"
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Current Squad
                  <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    {currentPlayers.length} players
                  </span>
                </h2>
              </div>
              <AnimatePresence>
                {currentPlayers.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                    {currentPlayers.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="flex items-center p-6 hover:bg-purple-50 cursor-pointer group"
                        onClick={() => handlePlayerClick(player.id)}
                      >
                        <div className="relative">
                          <img
                            src={player.photoUrl || 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1752302971/ff_nybtqf.jpg'}
                            alt={player.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1752302971/ff_nybtqf.jpg';
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600">
                            {player.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {player.role && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {player.role}
                              </span>
                            )}
                            {player.battingStyle && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {player.battingStyle}
                              </span>
                            )}
                            {player.bowlingStyle && player.bowlingStyle !== 'N/A' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {player.bowlingStyle}
                              </span>
                            )}
                          </div>
                        </div>
                        <FaChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
                  >
                    <Users className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No players in squad</h3>
                    <p className="mt-1 text-sm text-gray-500">This team doesn't have any players assigned yet.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;