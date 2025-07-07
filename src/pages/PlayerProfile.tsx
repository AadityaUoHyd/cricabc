import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User } from 'lucide-react';
import { type Player } from '../types/Player';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/players/${id}`);
        setPlayer(response.data as Player);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch player');
        console.error('Fetch player error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <p className="text-purple-600 text-center mt-8">Loading...</p>
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>
  if (!player) return <p className="text-gray-600 text-center mt-8">Player not found.</p>

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStatsTable = (stats: any, _format: string) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-purple-600">Batting Stats</h4>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-purple-100">
            <th className="border p-2 text-left">Stat</th>
            <th className="border p-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.batting || {}).map(([key, value]) => (
            <tr key={key}>
              <td className="border p-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
              <td className="border p-2 text-right">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="text-lg font-semibold text-purple-600">Bowling Stats</h4>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-purple-100">
            <th className="border p-2 text-left">Stat</th>
            <th className="border p-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.bowling || {}).map(([key, value]) => (
            <tr key={key}>
              <td className="border p-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
              <td className="border p-2 text-right">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="text-lg font-semibold text-purple-600">Wicketkeeping Stats</h4>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-purple-100">
            <th className="border p-2 text-left">Stat</th>
            <th className="border p-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Stumpings</td>
            <td className="border p-2 text-right">{stats.wicketKeeperStats?.stumps || 0}</td>
          </tr>
          <tr>
            <td className="border p-2">Catches</td>
            <td className="border p-2 text-right">{stats.wicketKeeperStats?.catches || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-800 flex items-center">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 mr-4 text-purple-600" />
                )}
                {player.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Country:</strong> {player.country}</p>
                <p><strong>Role:</strong> {player.role}</p>
                <p><strong>Gender:</strong> {player.gender}</p>
                <p><strong>Batting Style:</strong> {player.battingStyle}</p>
                <p><strong>Bowling Style:</strong> {player.bowlingStyle}</p>
                <p><strong>Birth Place:</strong> {player.birthPlace}</p>
                <p><strong>Date of Birth:</strong> {player.dateOfBirth ? formatDate(player.dateOfBirth) : '-'}</p>
                <p><strong>Height:</strong> {player.height || '-'}</p>
                <p><strong>Description:</strong> {player.description}</p>
              </div>
              <h3 className="text-xl font-semibold text-purple-600 mt-4">Rankings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <p><strong>Test Rank:</strong> {player.ranking?.testRank || '-'}</p>
                <p><strong>ODI Rank:</strong> {player.ranking?.odiRank || '-'}</p>
                <p><strong>T20 Rank:</strong> {player.ranking?.t20Rank || '-'}</p>
              </div>
              <Tabs defaultValue="test" className="mt-6">
                <TabsList className="grid grid-cols-3 sm:grid-cols-7 gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <TabsTrigger value="test" className="text-sm">Test</TabsTrigger>
                  <TabsTrigger value="odi" className="text-sm">ODI</TabsTrigger>
                  <TabsTrigger value="t20i" className="text-sm">T20I</TabsTrigger>
                  <TabsTrigger value="ipl" className="text-sm">IPL</TabsTrigger>
                  <TabsTrigger value="lista" className="text-sm">List A</TabsTrigger>
                  <TabsTrigger value="twenty20" className="text-sm">Twenty20</TabsTrigger>
                  <TabsTrigger value="firstclass" className="text-sm">First Class</TabsTrigger>
                </TabsList>
                <TabsContent value="test">{renderStatsTable(player.testStats, 'Test')}</TabsContent>
                <TabsContent value="odi">{renderStatsTable(player.odiStats, 'ODI')}</TabsContent>
                <TabsContent value="t20i">{renderStatsTable(player.ttwentyInternationalsStats, 'T20I')}</TabsContent>
                <TabsContent value="ipl">{renderStatsTable(player.iplStats, 'IPL')}</TabsContent>
                <TabsContent value="lista">{renderStatsTable(player.listAstats, 'List A')}</TabsContent>
                <TabsContent value="twenty20">{renderStatsTable(player.twenty20, 'Twenty20')}</TabsContent>
                <TabsContent value="firstclass">{renderStatsTable(player.firstClass, 'First Class')}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}