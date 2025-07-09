import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User } from 'lucide-react';
import { type Player } from '../types/Player';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('test');

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

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '-';
    const birthDate = new Date(date);
    const today = new Date(); // Current date: July 08, 2025, 12:37 AM IST
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const formattedDate = birthDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${formattedDate} (Age: ${age} years)`;
  };

  const renderStatsTable = (stats: any, format: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h4 className="text-xl font-semibold text-purple-700 mt-6">{format} Batting Stats</h4>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-purple-100 text-purple-800">
              <th className="p-3 text-left font-medium rounded-tl-lg">Stat</th>
              <th className="p-3 text-right font-medium rounded-tr-lg">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.batting || {}).map(([key, value], index) => (
              <motion.tr
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="hover:bg-purple-50 transition-colors"
              >
                <td className="p-3 capitalize border-b border-purple-100">{key.replace(/([A-Z])/g, ' $1')}</td>
                <td className="p-3 text-right border-b border-purple-100">{String(value)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="text-xl font-semibold text-purple-700 mt-6">{format} Bowling Stats</h4>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-purple-100 text-purple-800">
              <th className="p-3 text-left font-medium rounded-tl-lg">Stat</th>
              <th className="p-3 text-right font-medium rounded-tr-lg">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.bowling || {}).map(([key, value], index) => (
              <motion.tr
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="hover:bg-purple-50 transition-colors"
              >
                <td className="p-3 capitalize border-b border-purple-100">{key.replace(/([A-Z])/g, ' $1')}</td>
                <td className="p-3 text-right border-b border-purple-100">{String(value)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="text-xl font-semibold text-purple-700 mt-6">{format} Wicketkeeping Stats</h4>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-purple-100 text-purple-800">
              <th className="p-3 text-left font-medium rounded-tl-lg">Stat</th>
              <th className="p-3 text-right font-medium rounded-tr-lg">Value</th>
            </tr>
          </thead>
          <tbody>
            <motion.tr
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="hover:bg-purple-50 transition-colors"
            >
              <td className="p-3 border-b border-purple-100">Stumpings</td>
              <td className="p-3 text-right border-b border-purple-100">{stats.wicketKeeperStats?.stumps || 0}</td>
            </motion.tr>
            <motion.tr
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="hover:bg-purple-50 transition-colors"
            >
              <td className="p-3 border-b border-purple-100">Catches</td>
              <td className="p-3 text-right border-b border-purple-100">{stats.wicketKeeperStats?.catches || 0}</td>
            </motion.tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const formats = [
    { id: 'test', label: 'Test' },
    { id: 'odi', label: 'ODI' },
    { id: 't20i', label: 'T20I' },
    { id: 'ipl', label: (player?.gender === 'male' ? 'IPL' : 'WPL') },
    { id: 'lista', label: 'List A' },
    { id: 'twenty20', label: 'Twenty20' },
    { id: 'firstclass', label: 'First Class' },
  ];

  const countryCodeMap: { [key: string]: string } = {
  india: 'in',
  unitedstates: 'us',
  australia: 'au',
  england: 'gb',
  pakistan: 'pk',
  southafrica: 'za',
  newzealand: 'nz',
  srilanka: 'lk',
  bangladesh: 'bd',
  westindies: 'jm',
  afghanistan: 'af',
  ireland: 'ie',
  scotland: 'gb-sct',
  zimbabwe: 'zw',
  uae: 'ae',
  netherlands: 'nl',
  nepal: 'np',
  // Handle variations
  'united states': 'us',
  'south africa': 'za',
  'new zealand': 'nz',
  'sri lanka': 'lk',
  'west indies': 'jm',
  // Add more as per your API
};

const getCountryCode = (country: string): string => {
  // Normalize country name by removing spaces and special characters
  const normalizedCountry = country.replace(/\s+/g, '').toLowerCase();
  return countryCodeMap[normalizedCountry] || normalizedCountry; // Fallback to normalized if no match
};

  return (
    <div className="bg-gradient-to-b from-purple-50 to-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-purple-600 text-center text-lg font-medium mt-12"
            >
              Loading...
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-center text-lg font-medium mt-12"
            >
              {error}
            </motion.p>
          )}
          {!loading && !error && !player && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-600 text-center text-lg font-medium mt-12"
            >
              Player not found.
            </motion.p>
          )}
        </AnimatePresence>
        {player && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card className="shadow-xl border-none bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
  <CardTitle className="text-3xl sm:text-4xl font-extrabold flex items-center">
    {player.photoUrl ? (
      <motion.img
        src={player.photoUrl}
        alt={player.name}
        className="w-40 h-40 mr-4 object-cover border-2 border-white shadow-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
    ) : (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <User className="w-16 h-16 mr-4 text-purple-200" />
      </motion.div>
    )}
    {player.name}
    {player.country && (
      <motion.img
  src={`https://flagicons.lipis.dev/flags/4x3/${getCountryCode(player.country.toLowerCase())}.svg`}
  alt={`${player.country} flag`}
  className="w-8 h-6 ml-2 object-contain"
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.4 }}
  onError={(e) => {
    const countryCode = getCountryCode(player.country.toLowerCase());
    console.log('Attempted flag URL:', `https://flagicons.lipis.dev/flags/4x3/${countryCode}.svg`);
    console.error('Flag load error for country:', player.country, 'Code:', countryCode, e);
    (e.target as HTMLImageElement).style.display = 'none';
  }}
  onLoad={() => console.log('Flag loaded successfully for country:', player.country)}
/>
    )}
  </CardTitle>
</CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700"
                >
                  <p className="text-sm"><strong className="text-purple-700">Country:</strong> {player.country}</p>
                  <p className="text-sm"><strong className="text-purple-700">Role:</strong> {player.role}</p>
                  <p className="text-sm"><strong className="text-purple-700">Gender:</strong> {player.gender}</p>
                  <p className="text-sm"><strong className="text-purple-700">Batting Style:</strong> {player.battingStyle}</p>
                  <p className="text-sm"><strong className="text-purple-700">Bowling Style:</strong> {player.bowlingStyle}</p>
                  <p className="text-sm"><strong className="text-purple-700">Birth Place:</strong> {player.birthPlace}</p>
                  <p className="text-sm"><strong className="text-purple-700">Date of Birth:</strong> {player.dateOfBirth ? formatDate(player.dateOfBirth) : '-'}</p>
                  <p className="text-sm"><strong className="text-purple-700">Height:</strong> {player.height || '-'}</p>
                  <p className="text-sm"><strong className="text-purple-700">Test Cap No: </strong> {player.capNumber || '-'}, <strong className="text-purple-700">Jersey No:</strong> {player.jerseyNo || player.odiStats?.jerseyNo || '-'}</p>
                  <p className="text-sm col-span-1 sm:col-span-2 lg:col-span-3"><strong className="text-purple-700">Description:</strong> {player.description}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-purple-700 mb-4">ICC Rankings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-gray-700">
                    <p className="text-xl text-purple-700 mb-4">Test ranking : </p>
                    <p className="text-sm"><strong className="text-purple-700">Batting Rank:</strong> {player.ranking.testBattingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Bowling Rank:</strong> {player.ranking.testBowlingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Allrounder Rank:</strong> {player.ranking.testAllrounderRank || '-'}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-gray-700">
                    <p className="text-xl text-purple-700 mb-4">ODIs ranking : </p>
                    <p className="text-sm"><strong className="text-purple-700">Batting Rank:</strong> {player.ranking.odiBattingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Bowling Rank:</strong> {player.ranking.odiBowlingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Allrounder Rank:</strong> {player.ranking.odiAllrounderRank || '-'}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-gray-700">
                    <p className="text-xl text-purple-700 mb-4">T20Is ranking : </p>
                    <p className="text-sm"><strong className="text-purple-700">Batting Rank:</strong> {player.ranking.t20BattingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Bowling Rank:</strong> {player.ranking.t20BowlingRank || '-'}</p>
                    <p className="text-sm"><strong className="text-purple-700">Allrounder Rank:</strong> {player.ranking.t20AllrounderRank || '-'}</p>
                  </div>
                </motion.div>
                <div className="mt-8">
                  <div className="flex flex-nowrap overflow-x-auto space-x-2 bg-purple-50 p-3 rounded-xl shadow-sm mb-8 scrollbar-hide">
                    {formats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`text-xs sm:text-sm font-medium rounded-lg py-2 px-3 min-w-[80px] text-center transition-all ${
                          selectedFormat === format.id
                            ? 'bg-purple-600 text-white'
                            : 'text-purple-600 hover:bg-purple-100'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                  {selectedFormat === 'test' && renderStatsTable(player.testStats, 'Test')}
                  {selectedFormat === 'odi' && renderStatsTable(player.odiStats, 'ODI')}
                  {selectedFormat === 't20i' && renderStatsTable(player.ttwentyInternationalsStats, 'T20I')}

                  {selectedFormat === 'lista' && renderStatsTable(player.listAstats, 'List A')}
                  {selectedFormat === 'twenty20' && renderStatsTable(player.twenty20, 'Twenty20')}
                  {selectedFormat === 'firstclass' && renderStatsTable(player.firstClass, 'First Class')}
                  
                  {player.gender === 'female' && selectedFormat === 'ipl'
                      ? renderStatsTable(player.iplStats, 'WPL')  : renderStatsTable(player.iplStats, 'IPL')}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}