import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiCricketBat, GiTrophyCup } from 'react-icons/gi';
import { FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import type { Match } from '../types/Match';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';

interface PointsTableEntry {
  team: string;
  matches: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: string;
}

interface PlayerStats {
  playerId: string;
  name: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  economy: number;
  strikeRate: number;
}

export default function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>([]);
  const [topBatsmen, setTopBatsmen] = useState<PlayerStats[]>([]);
  const [topBowlers, setTopBowlers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState({
    match: true,
    pointsTable: true,
    stats: true
  });
  const [error, setError] = useState({
    match: '',
    pointsTable: '',
    stats: ''
  });

  const fetchMatchDetails = useCallback(async () => {
    if (!matchId) return;
    
    try {
      setLoading(prev => ({ ...prev, match: true }));
      const response = await axios.get<Match>(`${import.meta.env.VITE_API_URL}/api/matches/${matchId}`);
      setMatch(response.data);
      setError(prev => ({ ...prev, match: '' }));
    } catch (err) {
      console.error('Error fetching match details:', err);
      setError(prev => ({
        ...prev,
        match: 'Failed to load match details. Please try again later.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, match: false }));
    }
  }, [matchId]);

  const fetchPointsTable = useCallback(async (_tournamentId: string) => {
    try {
      setLoading(prev => ({ ...prev, pointsTable: true }));
      // Uncomment this when backend is ready
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/matches/tournament/${tournamentId}/points-table`);
      // setPointsTable(response.data);
      
      // Mock data for now
      setPointsTable([
        { team: 'Team A', matches: 5, won: 4, lost: 1, tied: 0, points: 8, nrr: '+1.25' },
        { team: 'Team B', matches: 5, won: 3, lost: 2, tied: 0, points: 6, nrr: '+0.75' },
        { team: 'Team C', matches: 5, won: 2, lost: 3, tied: 0, points: 4, nrr: '-0.25' },
        { team: 'Team D', matches: 5, won: 1, lost: 4, tied: 0, points: 2, nrr: '-1.75' },
      ]);
      
      setError(prev => ({ ...prev, pointsTable: '' }));
    } catch (err) {
      console.error('Error fetching points table:', err);
      setError(prev => ({
        ...prev,
        pointsTable: 'Failed to load points table. Please try again later.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, pointsTable: false }));
    }
  }, []);

  const fetchPlayerStats = useCallback(async (_tournamentId: string) => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      // Uncomment this when backend is ready
      // const [batsmenRes, bowlersRes] = await Promise.all([
      //   axios.get(`${import.meta.env.VITE_API_URL}/api/matches/tournament/${tournamentId}/top-batsmen?limit=3`),
      //   axios.get(`${import.meta.env.VITE_API_URL}/api/matches/tournament/${tournamentId}/top-bowlers?limit=3`)
      // ]);
      // setTopBatsmen(batsmenRes.data);
      // setTopBowlers(bowlersRes.data);
      
      // Mock data for now
      setTopBatsmen([
        { playerId: '1', name: 'Player 1', team: 'Team A', matches: 5, runs: 250, wickets: 0, average: 62.5, economy: 0, strikeRate: 145.2 },
        { playerId: '2', name: 'Player 2', team: 'Team B', matches: 5, runs: 198, wickets: 0, average: 49.5, economy: 0, strikeRate: 132.0 },
        { playerId: '3', name: 'Player 3', team: 'Team C', matches: 5, runs: 175, wickets: 0, average: 43.75, economy: 0, strikeRate: 128.7 },
      ]);
      
      setTopBowlers([
        { playerId: '4', name: 'Bowler 1', team: 'Team A', matches: 5, runs: 0, wickets: 12, average: 15.2, economy: 6.8, strikeRate: 13.4 },
        { playerId: '5', name: 'Bowler 2', team: 'Team B', matches: 5, runs: 0, wickets: 10, average: 18.6, economy: 7.2, strikeRate: 15.5 },
        { playerId: '6', name: 'Bowler 3', team: 'Team C', matches: 5, runs: 0, wickets: 8, average: 22.1, economy: 6.5, strikeRate: 20.3 },
      ]);
      
      setError(prev => ({ ...prev, stats: '' }));
    } catch (err) {
      console.error('Error fetching player stats:', err);
      setError(prev => ({
        ...prev,
        stats: 'Failed to load player statistics. Please try again later.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    if (match?.tournament) {
      fetchPointsTable(match.tournament);
      fetchPlayerStats(match.tournament);
    }
  }, [match, fetchPointsTable, fetchPlayerStats]);

  if (loading.match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <Tabs defaultValue="match">
          <TabsList>
            <TabsTrigger value="match">Match Details</TabsTrigger>
            <TabsTrigger value="points">Points Table</TabsTrigger>
            <TabsTrigger value="stats">Player Stats</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </Tabs>
      </div>
    );
  }

  if (error.match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error.match}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Match not found</h2>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const parsedDate = match.dateTimeGMT ? new Date(match.dateTimeGMT + 'Z') : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">{match.title}</h1>
        <p className="text-gray-600 mb-4">
          {match.matchType.toUpperCase()} • {match.tournament} • 
          {typeof match.venue === 'string' ? match.venue : match.venue.stadiumName}
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-purple-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Match Status</h2>
              <p className={`text-lg ${match.matchStarted && !match.matchEnded ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                {match.status}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-600">
                {parsedDate && !isNaN(parsedDate.getTime()) 
                  ? parsedDate.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })
                  : 'Date and time to be announced'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Teams</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <span className="font-medium">{match.team1}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <span className="font-medium">{match.team2}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Match Info</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Venue:</span> {typeof match.venue === 'string' ? match.venue : match.venue.stadiumName}</p>
                <p><span className="font-medium">Tournament:</span> {match.tournament}</p>
                <p><span className="font-medium">Match Type:</span> {match.matchType}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <GiTrophyCup className="w-4 h-4" />
            <span>Points Table</span>
          </TabsTrigger>
          <TabsTrigger value="batsmen" className="flex items-center gap-2">
            <GiCricketBat className="w-4 h-4" />
            <span>Top Batsmen</span>
          </TabsTrigger>
          <TabsTrigger value="bowlers" className="flex items-center gap-2">
            <FaChartLine className="w-4 h-4" />
            <span>Top Bowlers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiTrophyCup className="w-5 h-5" />
                {match.tournament} Points Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.pointsTable ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : error.pointsTable ? (
                <div className="text-center py-8 text-red-600">
                  <p>{error.pointsTable}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => match?.tournament && fetchPointsTable(match.tournament)}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">M</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">T</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">NRR</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pointsTable.map((entry, index) => (
                        <tr key={entry.team} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {entry.team}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {entry.matches}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {entry.won}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {entry.lost}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {entry.tied}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                            {entry.points}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                            entry.nrr.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.nrr}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batsmen">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiCricketBat className="w-5 h-5" />
                Top Batsmen - {match.tournament}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : error.stats ? (
                <div className="text-center py-8 text-red-600">
                  <p>{error.stats}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => match?.tournament && fetchPlayerStats(match.tournament)}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topBatsmen.map((batsman, index) => (
                    <div key={batsman.playerId} className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2 font-medium">{index + 1}.</span>
                            <h3 className="font-semibold text-lg">{batsman.name}</h3>
                            <span className="ml-2 text-sm text-gray-500">{batsman.team}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Matches</p>
                              <p className="font-medium">{batsman.matches}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Runs</p>
                              <p className="font-medium">{batsman.runs}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Average</p>
                              <p className="font-medium">{batsman.average.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Strike Rate</p>
                              <p className="font-medium">{batsman.strikeRate.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bowlers">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaChartLine className="w-5 h-5" />
                Top Bowlers - {match.tournament}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : error.stats ? (
                <div className="text-center py-8 text-red-600">
                  <p>{error.stats}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => match?.tournament && fetchPlayerStats(match.tournament)}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topBowlers.map((bowler, index) => (
                    <div key={bowler.playerId} className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2 font-medium">{index + 1}.</span>
                            <h3 className="font-semibold text-lg">{bowler.name}</h3>
                            <span className="ml-2 text-sm text-gray-500">{bowler.team}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Matches</p>
                              <p className="font-medium">{bowler.matches}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Wickets</p>
                              <p className="font-medium">{bowler.wickets}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Average</p>
                              <p className="font-medium">{bowler.average.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Economy</p>
                              <p className="font-medium">{bowler.economy.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Strike Rate</p>
                              <p className="font-medium">{bowler.strikeRate.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
