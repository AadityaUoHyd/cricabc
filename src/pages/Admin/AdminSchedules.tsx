import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { type Match } from '../../types/Match';

export default function AdminSchedules() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState<Match>({
    id: '',
    matchId: '',
    title: '',
    team1: '',
    team2: '',
    dateTimeGMT: '',
    status: '',
    matchType: '',
    tournament: '',
    venue: '',
    fantasyEnabled: false,
    bbbEnabled: false,
    hasSquad: false,
    matchStarted: false,
    matchEnded: false,
    fantasyLink: '',
    pointsTableLink: '',
    scheduleLink: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/matches`);
      setMatches(response.data as Match[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/matches/${form.matchId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/matches`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchMatches();
      setForm({
        id: '',
        matchId: '',
        title: '',
        team1: '',
        team2: '',
        dateTimeGMT: '',
        status: '',
        matchType: '',
        tournament: '',
        venue: '',
        fantasyEnabled: false,
        bbbEnabled: false,
        hasSquad: false,
        matchStarted: false,
        matchEnded: false,
        fantasyLink: '',
        pointsTableLink: '',
        scheduleLink: ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to save match');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match: Match) => {
  setForm({
    ...match,
    dateTimeGMT: match.dateTimeGMT ? new Date(match.dateTimeGMT).toISOString().slice(0, 16) : '',
  });
};


  const handleDelete = async (matchId: string) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMatches();
      setError(null);
    } catch (err) {
      setError('Failed to delete match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Manage Schedules</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-purple-600 mb-4">Loading...</p>}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <Label htmlFor="matchId" className="block text-sm font-medium text-gray-700">
            Match ID
          </Label>
          <input
            id="matchId"
            type="text"
            value={form.matchId}
            onChange={(e) => setForm({ ...form, matchId: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </Label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="team1" className="block text-sm font-medium text-gray-700">
            Team 1
          </Label>
          <input
            id="team1"
            type="text"
            value={form.team1}
            onChange={(e) => setForm({ ...form, team1: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="team2" className="block text-sm font-medium text-gray-700">
            Team 2
          </Label>
          <input
            id="team2"
            type="text"
            value={form.team2}
            onChange={(e) => setForm({ ...form, team2: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </Label>
          <input
            id="date"
            type="datetime-local"
            value={form.dateTimeGMT || ''}
            onChange={(e) => setForm({ ...form, dateTimeGMT: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Select Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="mb-4">
          <Label htmlFor="matchType" className="block text-sm font-medium text-gray-700">
            Match Type
          </Label>
          <select
            id="matchType"
            value={form.matchType}
            onChange={(e) => setForm({ ...form, matchType: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Select Match Type</option>
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
          </select>
        </div>
        <div className="mb-4">
          <Label htmlFor="tournament" className="block text-sm font-medium text-gray-700">
            Tournament
          </Label>
          <input
            id="tournament"
            type="text"
            value={form.tournament}
            onChange={(e) => setForm({ ...form, tournament: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-400"
        >
          {form.id ? 'Update Match' : 'Create Match'}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{match.title}</h3>
              <p className="text-sm text-gray-600">
                {match.team1} vs {match.team2} - {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Status: {match.status}, Type: {match.matchType}, Tournament: {match.tournament}
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(match)} className="text-purple-600 hover:underline" disabled={loading}>
                Edit
              </button>
              <button
                onClick={() => handleDelete(match.matchId)}
                className="text-red-600 hover:underline"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}