import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminMatches from './AdminMatches';
import { type Match } from '../../types/Match';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '@radix-ui/react-label';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    title: '',
    team1: '',
    team2: '',
    status: '',
    venue: '',
    matchType: '',
    tournament: '',
    dateTimeGMT: '',
    fantasyEnabled: false,
    bbbEnabled: false,
    hasSquad: false,
    matchStarted: false,
    matchEnded: false,
    fantasyLink: '',
    pointsTableLink: '',
    scheduleLink: '',
  });

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(data as Match[]);
    } catch (err: any) {
      console.error('Failed to load matches:', err);
      setError(err.response?.data?.message || 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/matches`, newMatch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsCreating(false);
      setNewMatch({
        title: '',
        team1: '',
        team2: '',
        status: '',
        venue: '',
        matchType: '',
        tournament: '',
        dateTimeGMT: '',
        fantasyEnabled: false,
        bbbEnabled: false,
        hasSquad: false,
        matchStarted: false,
        matchEnded: false,
        fantasyLink: '',
        pointsTableLink: '',
        scheduleLink: '',
      });
      fetchMatches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create match.');
      console.error('Create match error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewMatch((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) return <p className="text-center text-sm sm:text-base">Loading matches...</p>;

  if (error) return <p className="text-center text-red-500 text-sm sm:text-base">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Manage Matches</h2>
      <Button onClick={() => setIsCreating(!isCreating)} className="mb-4">
        {isCreating ? 'Cancel' : 'Create New Match'}
      </Button>
      {isCreating && (
        <form onSubmit={handleCreateMatch} className="bg-white p-4 rounded-lg shadow-md mb-4 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={newMatch.title} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="team1">Team 1</Label>
            <Input id="team1" name="team1" value={newMatch.team1} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="team2">Team 2</Label>
            <Input id="team2" name="team2" value={newMatch.team2} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" name="status" value={newMatch.status} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" name="venue" value={newMatch.venue} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="matchType">Match Type</Label>
            <Input id="matchType" name="matchType" value={newMatch.matchType} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="tournament">Tournament</Label>
            <Input id="tournament" name="tournament" value={newMatch.tournament} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="dateTimeGMT">Date & Time (GMT, ISO format)</Label>
            <Input id="dateTimeGMT" name="dateTimeGMT" value={newMatch.dateTimeGMT ?? ''} onChange={handleInputChange} />
          </div>
          <div className="flex items-center">
            <input
              id="fantasyEnabled"
              name="fantasyEnabled"
              type="checkbox"
              checked={newMatch.fantasyEnabled}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="fantasyEnabled">Fantasy Enabled</Label>
          </div>
          <div className="flex items-center">
            <input
              id="bbbEnabled"
              name="bbbEnabled"
              type="checkbox"
              checked={newMatch.bbbEnabled}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="bbbEnabled">Ball-by-Ball Enabled</Label>
          </div>
          <div className="flex items-center">
            <input
              id="hasSquad"
              name="hasSquad"
              type="checkbox"
              checked={newMatch.hasSquad}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="hasSquad">Has Squad</Label>
          </div>
          <div className="flex items-center">
            <input
              id="matchStarted"
              name="matchStarted"
              type="checkbox"
              checked={newMatch.matchStarted}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="matchStarted">Match Started</Label>
          </div>
          <div className="flex items-center">
            <input
              id="matchEnded"
              name="matchEnded"
              type="checkbox"
              checked={newMatch.matchEnded}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="matchEnded">Match Ended</Label>
          </div>
          <Button type="submit">Create Match</Button>
        </form>
      )}
      {matches.length === 0 ? (
        <p className="text-center text-sm sm:text-base">No matches available.</p>
      ) : (
        matches.map((match) => (
          <AdminMatches key={match.matchId} match={match} onUpdate={fetchMatches} />
        ))
      )}
    </div>
  );
}