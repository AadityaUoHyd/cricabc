import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, User } from 'lucide-react';
import { type Team } from '../types/Team';
import { type Player } from '../types/Player';
import { useNavigate } from 'react-router-dom';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [category, setCategory] = useState<'international' | 'domestic' | 'league'>('international');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [leagueName, setLeagueName] = useState<string>('');
  const [domesticTournamentName, setDomesticTournamentName] = useState<string>('');

  const maleLeagues = [
    'Indian Premier League (IPL)',
    'Big Bash League (BBL)',
    'Pakistan Super League (PSL)',
    'Caribbean Premier League (CPL)',
    'Bangladesh Premier League (BPL)',
    'Mzansi Super League (MSL)',
    'The Hundred',
    'Vitality Blast',
    'Super Smash',
    'Major League Cricket (MLC)',
    'T20 Mumbai League',
  ];
  const maleDomestic = [
    'Ranji Trophy',
    'Duleep Trophy',
    'Vijay Hazare Trophy',
    'Syed Mushtaq Ali Trophy',
    'Deodhar Trophy',
    'Irani Cup',
    'Vijay Merchant Trophy',
    'Cooch Behar Trophy (U19)',
    'Col. CK Nayudu Trophy (U23)',
    'Vinoo Mankad Trophy (U19 One Day)',
    "Men's U23 State A Trophy",
    "Men's Under 19 One Day Challenger Trophy",
    "Vijay Merchant Trophy (U16)",
  ];
  const femaleDomestic = [
    "Senior Women's One Day Trophy",
    "Senior Women's T20 Trophy",
    "Senior Women's Inter Zonal T20 Trophy",
    "Senior Women's Inter Zonal One Day Trophy",
    "Senior Women's Inter Zonal Multi Day Trophy",
    "Senior Women's One Day Challenger Trophy",
    "Senior Women's T20 Challenger Trophy",
    "Women's Under 19 One Day Trophy",
    "Women's Under 19 T20 Trophy",
    "Women's Under 23 One Day Trophy",
    "Women's Under 23 T20 Trophy",
    "Women's Under 15 One Day Trophy",
  ];
  const femaleLeagues = [
    "Women's Premier League (WPL)",
    "Women's Big Bash League (WBBL)",
    "The Hundred (Women's Competition)",
    'Charlotte Edwards Cup',
    "Women's Super Series",
    "Women's Asia Cup",
  ];
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, [category, gender, leagueName, domesticTournamentName, page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/teams`, {
        params: {
          page,
          size: 12,
          category,
          gender,
          leagueName: category === 'league' ? (leagueName || 'all') : 'all',
          domesticTournamentName: category === 'domestic' ? (domesticTournamentName || 'all') : 'all',
        },
      });
      const data = response.data as { teams: Team[]; totalPages: number };
      setTeams(data.teams || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
      console.error('Fetch teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async (team: Team) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/players`, {
        params: { teamId: team.id, category: team.category, page: 0, size: 100 },
      });
      setPlayers(response.data as Player[]);
      setSelectedTeam(team);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch players');
      console.error('Fetch players error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Cricket Teams
        </motion.h1>

        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        {loading && <p className="text-purple-600 text-center mb-4">Loading...</p>}

        <Tabs
          defaultValue="international"
          onValueChange={(val: any) => {
            const cat = val as 'international' | 'domestic' | 'league';
            setCategory(cat);
            if (cat !== 'league') setLeagueName('');
            if (cat !== 'domestic') setDomesticTournamentName('');
          }}
          className="mb-6 text-center"
        >
          <TabsList className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg shadow-sm mb-2 mx-auto">
            <TabsTrigger
              value="international"
              className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              International
            </TabsTrigger>
            <TabsTrigger
              value="domestic"
              className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Domestic
            </TabsTrigger>
            <TabsTrigger
              value="league"
              onClick={() => { setLeagueName(''); }}
              className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              League
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={gender}
          onValueChange={(val: string) => setGender(val as 'male' | 'female')}
          className="w-max mx-auto mb-4"
        >
          <TabsList className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg shadow-sm">
            <TabsTrigger
              value="male"
              className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Men
            </TabsTrigger>
            <TabsTrigger
              value="female"
              className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Women
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {category === 'domestic' && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {(gender === 'male' ? maleDomestic : femaleDomestic).map((dt) => (
              <button
                key={dt}
                onClick={() => { setDomesticTournamentName(dt); setPage(0); }}
                className={`px-3 py-1 rounded-md text-sm ${
                  domesticTournamentName === dt
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {dt}
              </button>
            ))}
          </div>
        )}

        {category === 'league' && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {(gender === 'male' ? maleLeagues : femaleLeagues).map((ln) => (
              <button
                key={ln}
                onClick={() => { setLeagueName(ln); setPage(0); }}
                className={`px-3 py-1 rounded-md text-sm ${
                  leagueName === ln
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {ln}
              </button>
            ))}
          </div>
        )}

        {teams.length === 0 && !loading && (
          <p className="text-center text-gray-600">No teams found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="w-8 h-8 mr-2 object-contain"
                    />
                  ) : (
                    <Users className="w-6 h-6 mr-2 text-purple-600" />
                  )}
                  {team.name}
                </CardTitle>
                <p className="text-xs text-gray-600">{team.country} | {team.category}</p>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white mt-2"
                  onClick={() => fetchPlayers(team)}
                >
                  View Players
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedTeam && players.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              Players of {selectedTeam?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <Card key={player.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-12 h-12 text-purple-600" />
                      )}
                      <div>
                        <h3
                          className="text-lg font-semibold text-purple-600 cursor-pointer hover:underline"
                          onClick={() => handlePlayerClick(player.id)}
                        >
                          {player.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {player.role} | {player.country}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 self-center">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}