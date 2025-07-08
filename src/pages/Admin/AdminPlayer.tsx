import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { type Player, type BowlingStats, type WicketKeeperStats, type BattingStats, type Ranking } from '../../types/Player';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Edit2, Trash2, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

type FormatStats = {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
};

export default function AdminPlayer() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState<Player>({
    id: '',
    name: '',
    country: '',
    gender: 'male',
    role: 'batsman',
    birthPlace: '',
    dateOfBirth: '',
    height: '',
    battingStyle: '',
    bowlingStyle: '',
    photoUrl: '',
    description: '',
    ranking: { testBattingRank: 0, odiBattingRank: 0, t20BattingRank: 0, testBattingRating: 0, odiBattingRating: 0, t20BattingRating: 0,
          testBowlingRank: 0, odiBowlingRank: 0, t20BowlingRank: 0, testBowlingRating: 0, odiBowlingRating: 0, t20BowlingRating: 0, 
          testAllrounderRank: 0, odiAllrounderRank: 0, t20AllrounderRank: 0, testAllrounderRating: 0, odiAllrounderRating: 0, t20AllrounderRating: 0
         },
    testStats: initFormatStats(),
    odiStats: initFormatStats(),
    ttwentyInternationalsStats: initFormatStats(),
    iplStats: initFormatStats(),
    listAstats: initFormatStats(),
    twenty20: initFormatStats(),
    firstClass: initFormatStats(),
    domesticTeams: [],
    internationalTeams: [],
    leagues: [],
    capNumber:'',
    jerseyNo:'',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [cricApiData, setCricApiData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  function initFormatStats(): FormatStats {
    return {
      batting: {
        matches: 0, innings: 0, runs: 0, highestScore: '0', notOuts: 0, ballsFaced: 0,
        average: 0, strikeRate: 0, fours: 0, sixes: 0, fifties: 0, hundreds: 0,
        doubleHundreds: 0, tripleHundreds: 0, quadrupleHundreds: 0, playerStatus: 'Active Player'
      },
      bowling: {
        matches: 0, innings: 0, ballsBowled: 0, runsGiven: 0, wickets: 0, average: 0,
        strikeRate: 0, economy: 0, bestBowlingInnings: '', bestBowlingMatch: '',
        fiveWicketHauls: 0, tenWicketMatches: 0, catchTaken: 0
      },
      wicketKeeperStats: { stumps: 0, catches: 0 },
      debutDate: '',
      lastPlayedDate: '',
      ranking: { testBattingRank: 0, odiBattingRank: 0, t20BattingRank: 0, testBattingRating: 0, odiBattingRating: 0, t20BattingRating: 0,
          testBowlingRank: 0, odiBowlingRank: 0, t20BowlingRank: 0, testBowlingRating: 0, odiBowlingRating: 0, t20BowlingRating: 0, 
          testAllrounderRank: 0, odiAllrounderRank: 0, t20AllrounderRank: 0, testAllrounderRating: 0, odiAllrounderRating: 0, t20AllrounderRating: 0
         },
      capNumber: '',
      jerseyNo: '',
    };
  }

  useEffect(() => {
    fetchPlayers();
  }, [page]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/players`, {
        params: { teamId: '', category: 'international', page, size: 12 },
      });
      const data = response.data as { content: Player[]; totalPages: number };
      setPlayers((data.content || []) as Player[]);
      setTotalPages((data.totalPages || 1) as number);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch players');
      console.error('Fetch players error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
  'player',
  new Blob([JSON.stringify(form)], { type: 'application/json' })
);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
          
        },
      };

      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/players/${form.id}`, formData, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/players`, formData, config);
      }
      fetchPlayers();
      setForm({
        id: '',
        name: '',
        country: '',
        gender: 'male',
        role: 'batsman',
        birthPlace: '',
        dateOfBirth: '',
        height: '',
        battingStyle: '',
        bowlingStyle: '',
        photoUrl: '',
        description: '',
        ranking: { testBattingRank: 0, odiBattingRank: 0, t20BattingRank: 0, testBattingRating: 0, odiBattingRating: 0, t20BattingRating: 0,
          testBowlingRank: 0, odiBowlingRank: 0, t20BowlingRank: 0, testBowlingRating: 0, odiBowlingRating: 0, t20BowlingRating: 0, 
          testAllrounderRank: 0, odiAllrounderRank: 0, t20AllrounderRank: 0, testAllrounderRating: 0, odiAllrounderRating: 0, t20AllrounderRating: 0
         },
        testStats: initFormatStats(),
        odiStats: initFormatStats(),
        ttwentyInternationalsStats: initFormatStats(),
        iplStats: initFormatStats(),
        listAstats: initFormatStats(),
        twenty20: initFormatStats(),
        firstClass: initFormatStats(),
        domesticTeams: [],
        internationalTeams: [],
        leagues: [],
        capNumber:'',
        jerseyNo:'',
      });
      setProfileImage(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save player');
      console.error('Save player error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCricApi = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/players/import-cricapi`, cricApiData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlayers();
      setCricApiData({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import player from CricAPI');
      console.error('Import CricAPI error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setForm({
      ...player,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : '',
      ranking: player.ranking || { testRank: 0, odiRank: 0, t20Rank: 0, testRating: 0, odiRating: 0, t20Rating: 0 },
      testStats: player.testStats || initFormatStats(),
      odiStats: player.odiStats || initFormatStats(),
      ttwentyInternationalsStats: player.ttwentyInternationalsStats || initFormatStats(),
      iplStats: player.iplStats || initFormatStats(),
      listAstats: player.listAstats || initFormatStats(),
      twenty20: player.twenty20 || initFormatStats(),
      firstClass: player.firstClass || initFormatStats(),
    });
    setProfileImage(null);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlayers();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete player');
      console.error('Delete player error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (format: keyof Player, field: keyof FormatStats, subField: string, value: any) => {
    setForm((prev) => {
      const formatStats = prev[format] as FormatStats;
      return {
        ...prev,
        [format]: {
          ...formatStats,
          [field]: field === 'batting' || field === 'bowling' || field === 'wicketKeeperStats'
            ? {
                ...(formatStats[field] as any),
                [subField]: value,
              }
            : value,
        },
      };
    });
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-4xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">Manage Players</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="test">Test Stats</TabsTrigger>
                <TabsTrigger value="odi">ODI Stats</TabsTrigger>
                <TabsTrigger value="t20i">T20I Stats</TabsTrigger>
                <TabsTrigger value="ipl">IPL Stats</TabsTrigger>
                <TabsTrigger value="lista">List A Stats</TabsTrigger>
                <TabsTrigger value="twenty20">Twenty20 Stats</TabsTrigger>
                <TabsTrigger value="firstclass">First Class Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <input
                      id="country"
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    >
                      <option value="batsman">Batsman</option>
                      <option value="bowler">Bowler</option>
                      <option value="allrounder">Allrounder</option>
                      <option value="wicketkeeper">Wicketkeeper</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="birthPlace">Birth Place</Label>
                    <input
                      id="birthPlace"
                      type="text"
                      value={form.birthPlace}
                      onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={typeof form.dateOfBirth === 'string' ? form.dateOfBirth : form.dateOfBirth?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <input
                      id="height"
                      type="text"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <input
                      id="description"
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="battingStyle">Batting Style</Label>
                    <input
                      id="battingStyle"
                      type="text"
                      value={form.battingStyle}
                      onChange={(e) => setForm({ ...form, battingStyle: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bowlingStyle">Bowling Style</Label>
                    <input
                      id="bowlingStyle"
                      type="text"
                      value={form.bowlingStyle}
                      onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profileImage">Player Image</Label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                    />
                    {form.photoUrl && (
                      <img src={form.photoUrl} alt="Player" className="mt-2 h-20 w-20 object-contain" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="internationalTeams">International Team IDs</Label>
                    <input
                      id="internationalTeams"
                      type="text"
                      value={form.internationalTeams.join(',')}
                      onChange={(e) => setForm({ ...form, internationalTeams: e.target.value.split(',').map(id => id.trim()).filter(id => id) })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      placeholder="Comma-separated team IDs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domesticTeams">Domestic Team IDs</Label>
                    <input
                      id="domesticTeams"
                      type="text"
                      value={form.domesticTeams.join(',')}
                      onChange={(e) => setForm({ ...form, domesticTeams: e.target.value.split(',').map(id => id.trim()).filter(id => id) })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      placeholder="Comma-separated team IDs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leagues">League Team IDs</Label>
                    <input
                      id="leagues"
                      type="text"
                      value={form.leagues.join(',')}
                      onChange={(e) => setForm({ ...form, leagues: e.target.value.split(',').map(id => id.trim()).filter(id => id) })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      placeholder="Comma-separated team IDs"
                    />
                  </div>
                </div>
              </TabsContent>
              {[
                { key: 'testStats', label: 'test' },
                { key: 'odiStats', label: 'odi' },
                { key: 'ttwentyInternationalsStats', label: 't20i' },
                { key: 'iplStats', label: 'ipl' },
                { key: 'listAstats', label: 'lista' },
                { key: 'twenty20', label: 'twenty20' },
                { key: 'firstClass', label: 'firstclass' },
              ].map(({ key, label }) => (
                <TabsContent key={key} value={label}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${key}-debutDate`}>Debut Date</Label>
                      <input
                        id={`${key}-debutDate`}
                        type="date"
                        value={(form[key as keyof Player] as FormatStats).debutDate || ''}
                        onChange={(e) => updateStats(key as keyof Player, 'debutDate', 'debutDate', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${key}-lastPlayedDate`}>Last Played Date</Label>
                      <input
                        id={`${key}-lastPlayedDate`}
                        type="date"
                        value={(form[key as keyof Player] as FormatStats).lastPlayedDate || ''}
                        onChange={(e) => updateStats(key as keyof Player, 'lastPlayedDate', 'lastPlayedDate', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${key}-jerseyNo`}>Jersey Number</Label>
                      <input
                        id={`${key}-jerseyNo`}
                        type="text"
                        value={(form[key as keyof Player] as FormatStats).jerseyNo || ''}
                        onChange={(e) => updateStats(key as keyof Player, 'jerseyNo', 'jerseyNo', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                      />
                    </div>
                    <h4 className="text-lg font-semibold text-purple-600">Batting Stats</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['matches', 'innings', 'runs', 'highestScore', 'notOuts', 'ballsFaced', 'average', 'strikeRate', 'fours', 'sixes', 'fifties', 'hundreds', 'doubleHundreds', 'tripleHundreds', 'quadrupleHundreds', 'playerStatus'].map((field) => (
                        <div key={field}>
                          <Label htmlFor={`${key}-batting-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                          <input
                            id={`${key}-batting-${field}`}
                            type={['average', 'strikeRate'].includes(field) ? 'number' : 'number'}
                            step={['average', 'strikeRate'].includes(field) ? '0.01' : undefined}
                            value={(form[key as keyof Player] as FormatStats).batting[field as keyof BattingStats] || 0}
                            onChange={(e) => updateStats(key as keyof Player, 'batting', field, ['average', 'strikeRate'].includes(field) ? Number(e.target.value) : Number(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          />
                        </div>
                      ))}
                    </div>
                    <h4 className="text-lg font-semibold text-purple-600">Bowling Stats</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['matches', 'innings', 'ballsBowled', 'runsGiven', 'wickets', 'average', 'strikeRate', 'economy', 'bestBowlingInnings', 'bestBowlingMatch', 'fiveWicketHauls', 'tenWicketMatches', 'catchTaken'].map((field) => (
                        <div key={field}>
                          <Label htmlFor={`${key}-bowling-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                          <input
                            id={`${key}-bowling-${field}`}
                            type={['bestBowlingInnings', 'bestBowlingMatch'].includes(field) ? 'text' : ['average', 'strikeRate', 'economy'].includes(field) ? 'number' : 'number'}
                            step={['average', 'strikeRate', 'economy'].includes(field) ? '0.01' : undefined}
                            value={(form[key as keyof Player] as FormatStats).bowling[field as keyof BowlingStats] || (['bestBowlingInnings', 'bestBowlingMatch'].includes(field) ? '' : 0)}
                            onChange={(e) => updateStats(key as keyof Player, 'bowling', field, ['average', 'strikeRate', 'economy'].includes(field) ? Number(e.target.value) : e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          />
                        </div>
                      ))}
                    </div>
                    <h4 className="text-lg font-semibold text-purple-600">Wicketkeeping Stats</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['stumps', 'catches'].map((field) => (
                        <div key={field}>
                          <Label htmlFor={`${key}-wk-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                          <input
                            id={`${key}-wk-${field}`}
                            type="number"
                            value={(form[key as keyof Player] as FormatStats).wicketKeeperStats[field as keyof WicketKeeperStats] || 0}
                            onChange={(e) => updateStats(key as keyof Player, 'wicketKeeperStats', field, Number(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              {form.id ? 'Update Player' : 'Create Player'}
            </Button>
          </form>
          <div className="mt-4">
            <Label htmlFor="cricApiData">Import from CricAPI (JSON)</Label>
            <textarea
              id="cricApiData"
              value={JSON.stringify(cricApiData, null, 2)}
              onChange={(e) => {
                try {
                  setCricApiData(JSON.parse(e.target.value));
                } catch {
                  setError('Invalid JSON format');
                }
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
              rows={5}
            />
            <Button
              onClick={handleImportCricApi}
              disabled={loading}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              Import from CricAPI
            </Button>
          </div>
        </CardContent>
      </Card>
      {players.length === 0 && !loading && (
        <p className="text-center text-gray-600">No players found.</p>
      )}
      <div className="grid grid-cols-1 gap-4">
        {players.map((player) => (
          <Card key={player.id} className="shadow-sm">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
              <div className="flex items-center space-x-4">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.name} className="w-12 h-12 object-cover" />
                ) : (
                  <User className="w-6 h-12 text-purple-600" />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-600">{player.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{player.country} | {player.role}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(player)}
                  disabled={loading}
                  className="text-purple-600 border-purple-600 text-xs sm:text-sm"
                >
                  <Edit2 className="w-3 h-3 sm:h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(player.id)}
                  disabled={loading}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 self-center">Page {page + 1} of {totalPages}</span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}