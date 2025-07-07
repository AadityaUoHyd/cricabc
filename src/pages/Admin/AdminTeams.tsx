import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Edit2, Trash2, Users } from 'lucide-react';
import { type Team } from '../../types/Team';

export default function AdminTeams() {
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
    'T20 Mumbai League'
  ];

  const femaleLeagues = [
    "Women's Premier League (WPL)",
    "Women's Big Bash League (WBBL)",
    "The Hundred (Women's Competition)",
    'Charlotte Edwards Cup',
    "Women's Super Series",
    "Super Smash (Women's)",
    "Global Super League (Women's)",
    "Women's Asia Cup"
  ];

  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<Team>({
    id: '',
    name: '',
    country: '',
    gender: 'male',
    category: 'international',
    leagueName: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTeams();
  }, [page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/teams`, {
        params: { category: 'all', page, size: 10 },
      });
      const data = response.data as { teams: Team[]; totalPages: number };
      setTeams((data.teams || []) as Team[]);
      setTotalPages((data.totalPages || 1) as number);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
      console.error('Fetch teams error:', err);
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
        'team',
        new Blob([JSON.stringify(form)], { type: 'application/json' })
      );
      if (logoFile) {
        formData.append('logoFile', logoFile);
      }


      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/teams/${form.id}`, formData, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/teams`, formData, config);
      }
      fetchTeams();
      setForm({ id: '', name: '', country: '', gender: 'male', category: 'international', leagueName: '', logoUrl: '' });
      setLogoFile(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save team');
      console.error('Save team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setForm({ ...team, leagueName: team.leagueName || '' });
    setLogoFile(null);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeams();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete team');
      console.error('Delete team error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-4xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">Manage Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name</Label>
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
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as 'international' | 'domestic' | 'league';
                  setForm({ ...form, category: cat, leagueName: cat === 'league' ? form.leagueName : '' });
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
              >
                <option value="international">International</option>
                <option value="domestic">Domestic</option>
                <option value="league">League</option>
              </select>
            </div>

            {form.category === 'league' && (
              <div>
                <Label htmlFor="leagueName">League Name</Label>
                <select
                  id="leagueName"
                  value={form.leagueName}
                  onChange={(e) => setForm({ ...form, leagueName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                  required
                >
                  <option value="">Select League</option>
                  {(form.gender === 'male' ? maleLeagues : femaleLeagues).map((ln) => (
                    <option key={ln} value={ln}>{ln}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="logoFile">Team Logo</Label>
              <input
                id="logoFile"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
              />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="Team Logo" className="mt-2 h-20 w-20 object-contain" />
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              {form.id ? 'Update Team' : 'Create Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
      {teams.length === 0 && !loading && (
        <p className="text-center text-gray-600">No teams found.</p>
      )}
      <div className="grid grid-cols-1 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="shadow-sm">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
              <div className="flex items-center space-x-4">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-12 h-12 object-contain" />
                ) : (
                  <Users className="w-12 h-12 text-purple-600" />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-600">{team.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{team.country} | {team.category}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(team)}
                  disabled={loading}
                  className="text-purple-600 border-purple-600 text-xs sm:text-sm"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(team.id)}
                  disabled={loading}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Delete
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