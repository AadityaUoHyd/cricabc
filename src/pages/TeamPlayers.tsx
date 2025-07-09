import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayers } from '../context/PlayerContext';

interface LocationState {
  teamName: string;
  category: string;
  country?: string;
  name?: string;
  gender?: string;
}

const TeamPlayers: React.FC = () => {

  const location = useLocation();
  const state = location.state as LocationState;
  const { players, loading, error } = usePlayers();

  // Filtering logic based on category
  const stripAsterisk = (name: string) => name?.replace(/\*+$/, '').trim().toLowerCase();

const filteredPlayers = React.useMemo(() => {
  // Debug logs for filtering
  console.log("State in TeamPlayers:", state);
  console.log("Players in TeamPlayers:", players);
  if (!state?.category) return [];

  // Helper to safely get and clean a string
  const clean = (str: string | undefined) => stripAsterisk(str || "");

  if (state.category === 'international') {
    // Prefer team.country for international matching
    const countryStripped = clean(state.country);
    if (countryStripped) {
      return players.filter(p =>
        Array.isArray(p.internationalTeams) &&
        p.internationalTeams.some(
          (t: string) => clean(t) === countryStripped
        )
      );
    }
  } else if (state.category === 'league') {
    // Prefer team.name for league matching, and gender must match
    const leagueNameStripped = clean(state.name);
    if (leagueNameStripped && state.gender) {
      return players.filter(p =>
        p.gender === state.gender &&
        Array.isArray(p.leagues) &&
        p.leagues.some(
          (l: string) => clean(l) === leagueNameStripped
        )
      );
    }
  } else if (state.category === 'domestic') {
    // Fallback to previous logic for domestic
    const teamNameStripped = clean(state.teamName);
    return players.filter(p =>
      Array.isArray(p.domesticTeams) &&
      p.domesticTeams.some(
        (t: string) => clean(t) === teamNameStripped
      )
    );
  }
  return [];
}, [players, state]);

  // Debug log for filtered players
  console.log("Filtered players:", filteredPlayers);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginTop: 32 }}>{state?.teamName || 'Team'} Players</h2>
      {loading && <div>Loading players...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <li key={player.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                {player.name}
              </li>
            ))
          ) : (
            <li style={{ padding: '8px 0', color: '#888' }}>No players found for this team.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default TeamPlayers;
