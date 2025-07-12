import { useState, useEffect } from 'react';
import { useMatches } from '../../context/MatchesContext';
import type { Match } from '../../types/Match';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '@radix-ui/react-label';

interface NewMatch extends Omit<Match, 'id' | 'venue'> {
  venue: {
    stadiumName: string;
    city: string;
    country: string;
  };
}

export default function AdminMatchesPage() {
  const { matches, loading, error, createMatch, fetchMatches } = useMatches();
  const [isCreating, setIsCreating] = useState(false);
  const [newMatch, setNewMatch] = useState<NewMatch>({
    title: '',
    team1: '',
    team2: '',
    status: '',
    venue: {
      stadiumName: '',
      city: '',
      country: '',
    },
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
    matchId: '', // Add matchId with a default empty string
  });

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMatch(newMatch);
      setIsCreating(false);
      setNewMatch({
        title: '',
        team1: '',
        team2: '',
        status: '',
        venue: {
          stadiumName: '',
          city: '',
          country: '',
        },
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
        matchId: '', // Add matchId with a default empty string
      });
    } catch (err) {
      console.error('Create match error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('venue.')) {
      const venueField = name.split('.')[1] as keyof NewMatch['venue'];
      setNewMatch(prev => ({
        ...prev,
        venue: {
          ...prev.venue,
          [venueField]: value
        }
      }));
    } else {
      setNewMatch(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Show loading state only on initial load
  if (loading && matches.length === 0) {
    return <p className="text-center text-sm sm:text-base p-8">Loading matches...</p>;
  }
  
  // Show error state
  if (error) {
    return <p className="text-center text-red-500 text-sm sm:text-base p-4">{error}</p>;
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Manage Matches</h2>
      <Button onClick={() => setIsCreating(!isCreating)} className="mb-4">
        {isCreating ? 'Cancel' : 'Create New Match'}
      </Button>
      
      {isCreating && (
        <form onSubmit={handleCreateMatch} className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={newMatch.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="matchType">Match Type</Label>
              <Input 
                id="matchType" 
                name="matchType" 
                value={newMatch.matchType} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="team1">Team 1</Label>
              <Input 
                id="team1" 
                name="team1" 
                value={newMatch.team1} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="team2">Team 2</Label>
              <Input 
                id="team2" 
                name="team2" 
                value={newMatch.team2} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input 
                id="status" 
                name="status" 
                value={newMatch.status} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="tournament">Tournament</Label>
              <Input 
                id="tournament" 
                name="tournament" 
                value={newMatch.tournament} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="venue.stadiumName">Venue Name</Label>
              <Input 
                id="venue.stadiumName" 
                name="venue.stadiumName" 
                value={newMatch.venue.stadiumName} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="dateTimeGMT">Date & Time (GMT)</Label>
              <Input 
                type="datetime-local"
                id="dateTimeGMT" 
                name="dateTimeGMT" 
                value={newMatch.dateTimeGMT || ''} 
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fantasyEnabled"
                name="fantasyEnabled"
                checked={newMatch.fantasyEnabled}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <Label htmlFor="fantasyEnabled">Fantasy Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bbbEnabled"
                name="bbbEnabled"
                checked={newMatch.bbbEnabled}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <Label htmlFor="bbbEnabled">Ball-by-Ball</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasSquad"
                name="hasSquad"
                checked={newMatch.hasSquad}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <Label htmlFor="hasSquad">Has Squad</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="matchStarted"
                name="matchStarted"
                checked={newMatch.matchStarted}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <Label htmlFor="matchStarted">Match Started</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="matchEnded"
                name="matchEnded"
                checked={newMatch.matchEnded}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <Label htmlFor="matchEnded">Match Ended</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Match</Button>
          </div>
        </form>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upcoming Matches</h3>
        {matches.length === 0 ? (
          <p className="text-center text-gray-500">No matches scheduled yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <h4 className="font-medium">{match.title}</h4>
                <p className="text-sm text-gray-600">
                  {match.team1} vs {match.team2}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {match.venue && typeof match.venue === 'object' 
                    ? `${match.venue.stadiumName}, ${match.venue.city}`
                    : match.venue}
                </p>
                <p className="text-sm text-gray-500">
                  {match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleString() : 'TBD'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}