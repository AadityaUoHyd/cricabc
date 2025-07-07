import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GiCricketBat } from 'react-icons/gi';
import { type Match } from '../../types/Match';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '@radix-ui/react-label';

interface AdminMatchProps {
  match: Match;
  onUpdate: () => void;
}

export default function AdminMatches({ match, onUpdate }: AdminMatchProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Match>({ ...match });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/matches/${match.matchId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update match');
      console.error('Update match error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/matches/${match.matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete match');
      console.error('Delete match error:', err);
    }
  };

  const parsedDate = match.dateTimeGMT ? new Date(match.dateTimeGMT + 'Z') : null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 border-purple-600">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="team1">Team 1</Label>
            <Input
              id="team1"
              name="team1"
              value={formData.team1}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="team2">Team 2</Label>
            <Input
              id="team2"
              name="team2"
              value={formData.team2}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="matchType">Match Type</Label>
            <Input
              id="matchType"
              name="matchType"
              value={formData.matchType}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="tournament">Tournament</Label>
            <Input
              id="tournament"
              name="tournament"
              value={formData.tournament}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="dateTimeGMT">Date & Time (GMT, ISO format)</Label>
            <Input
              id="dateTimeGMT"
              name="dateTimeGMT"
              value={formData.dateTimeGMT || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex items-center">
            <input
              id="fantasyEnabled"
              name="fantasyEnabled"
              type="checkbox"
              checked={formData.fantasyEnabled}
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
              checked={formData.bbbEnabled}
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
              checked={formData.hasSquad}
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
              checked={formData.matchStarted}
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
              checked={formData.matchEnded}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Label htmlFor="matchEnded">Match Ended</Label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex space-x-4">
            <Button type="submit">Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GiCricketBat className="w-6 h-6 mr-2 text-purple-600" />
              <h3 className="text-lg font-semibold">{match.title}</h3>
            </div>
            <span className={`text-sm ${match.matchStarted && !match.matchEnded ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {match.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{match.matchType.toUpperCase()} • {match.tournament}</p>
          <p className="text-sm text-gray-600">Venue: {match.venue}</p>
          <div className="mt-2">
            <p className="text-gray-700 font-medium">{match.team1} vs {match.team2}</p>
            <p className="text-xs text-gray-500">
              {parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString() : 'Date unavailable'}
            </p>
          </div>
          <div className="mt-2 text-sm">
            <p>Fantasy Enabled: {match.fantasyEnabled ? 'Yes' : 'No'}</p>
            <p>Ball-by-Ball Enabled: {match.bbbEnabled ? 'Yes' : 'No'}</p>
            <p>Has Squad: {match.hasSquad ? 'Yes' : 'No'}</p>
            <p>Match Started: {match.matchStarted ? 'Yes' : 'No'}</p>
            <p>Match Ended: {match.matchEnded ? 'Yes' : 'No'}</p>
          </div>
          <div className="mt-4 flex space-x-4 text-sm">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            <Link to={match.fantasyLink} className="text-purple-600 hover:underline">Fantasy</Link>
            <Link to={match.pointsTableLink} className="text-purple-600 hover:underline">Points Table</Link>
            <Link to={match.scheduleLink} className="text-purple-600 hover:underline">Schedule</Link>
          </div>
        </div>
      )}
    </div>
  );
}