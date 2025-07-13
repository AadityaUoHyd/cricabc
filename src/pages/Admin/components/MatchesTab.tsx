import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input as BaseInput } from '../../../components/ui/input';
import { Select as BaseSelect } from '../../../components/ui/select';

// Custom Input with label
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, id, ...props }, ref) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {props.required && <span className="text-red-500">*</span>}
    </label>
    <BaseInput
      ref={ref}
      id={id}
      className="w-full"
      {...props}
    />
  </div>
));

// Custom Select with label
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { 
    label: string; 
    options: { value: string; label: string }[] 
  }
>(({ label, id, options, ...props }, ref) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {props.required && <span className="text-red-500">*</span>}
    </label>
    <BaseSelect
      ref={ref}
      id={id}
      className="w-full"
      {...props}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </BaseSelect>
  </div>
));

interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  date: string;
  time: string;
  venue: string;
  venueId: string;
  matchType: string;
  title: string;
  dateTimeGMT?: string;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
}

interface MatchesTabProps {
  series: {
    id: string;
    name: string;
    matches: Match[];
    startDate: string;
    endDate: string;
    teamIds: string[];
  } | undefined;
  teams: Team[];
  venues: Venue[];
  onAddMatch: (match: Omit<Match, 'id'>) => Promise<void>;
  onEditMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  loading: boolean;
}

export const MatchesTab: React.FC<MatchesTabProps> = ({
  series,
  teams,
  venues,
  onAddMatch,
  onEditMatch,
  onDeleteMatch,
  loading,
}) => {
  const [newMatch, setNewMatch] = useState<Omit<Match, 'id' | 'dateTimeGMT'>>({
    team1Id: '',
    team2Id: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    venue: '',
    venueId: '',
    matchType: 'T20',
    title: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.team1Id || !newMatch.team2Id || !newMatch.date || !newMatch.time || !newMatch.venueId) {
      return;
    }
    
    // Create a new match with all required fields
    const matchToAdd: Omit<Match, 'id'> = {
      ...newMatch,
      title: newMatch.title || `${teams.find(t => t.id === newMatch.team1Id)?.name} vs ${teams.find(t => t.id === newMatch.team2Id)?.name}`,
      dateTimeGMT: new Date(`${newMatch.date}T${newMatch.time}:00Z`).toISOString()
    };
    
    await onAddMatch(matchToAdd);
    
    // Reset form with default values
    setNewMatch({
      team1Id: '',
      team2Id: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      venue: '',
      venueId: '',
      matchType: 'T20',
      title: '',
    });
  };

  if (!series) return <div className="text-gray-500">Please select a series to view matches</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Add New Match</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="team1Id"
              label="Team 1"
              value={newMatch.team1Id}
              onChange={(e) => setNewMatch({ ...newMatch, team1Id: e.target.value })}
              options={teams
                .filter((team) => series.teamIds.includes(team.id) && team.id !== newMatch.team2Id)
                .map((team) => ({ value: team.id, label: team.name }))}
              required
            />
            <Select
              id="team2Id"
              label="Team 2"
              value={newMatch.team2Id}
              onChange={(e) => setNewMatch({ ...newMatch, team2Id: e.target.value })}
              options={teams
                .filter((team) => series.teamIds.includes(team.id) && team.id !== newMatch.team1Id)
                .map((team) => ({ value: team.id, label: team.name }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="date"
              label="Match Date"
              type="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              min={series.startDate}
              max={series.endDate}
              required
            />
            <Input
              id="time"
              label="Match Time"
              type="time"
              value={newMatch.time}
              onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
              required
            />
          </div>

          <Select
            id="venue"
            label="Venue"
            value={newMatch.venueId || ''}
            onChange={(e) => {
              const venue = venues.find((v) => v.id === e.target.value);
              if (venue) {
                setNewMatch({
                  ...newMatch,
                  venueId: venue.id,
                  venue: venue.name,
                });
              } else {
                setNewMatch({
                  ...newMatch,
                  venueId: '',
                  venue: '',
                });
              }
            }}
            options={venues.map((venue) => ({
              value: venue.id,
              label: `${venue.name}, ${venue.city}, ${venue.country}`,
            }))}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Match'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Matches in {series.name}</h3>
        </div>
        <div className="divide-y">
          {series.matches.length > 0 ? (
            series.matches.map((match) => {
              const team1 = teams.find((t) => t.id === match.team1Id);
              const team2 = teams.find((t) => t.id === match.team2Id);
              const venue = venues.find((v) => v.id === match.venueId);

              return (
                <div key={match.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {team1?.shortName || 'T1'} vs {team2?.shortName || 'T2'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(match.dateTimeGMT || match.date).toLocaleString()}
                      </p>
                      {venue && (
                        <p className="text-sm text-gray-500">
                          {venue.name}, {venue.city}
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditMatch(match)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteMatch(match.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">No matches scheduled yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
