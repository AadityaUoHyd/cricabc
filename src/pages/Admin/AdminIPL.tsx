import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { type Team } from '../../types/Team';
import { type Match } from '../../types/Match';

interface TeamsResponse {
  content: Team[];
  // Add other pagination properties if your API returns them
  // page: number;
  // size: number;
  // totalElements: number;
  // totalPages: number;
}

interface PlayersResponse {
  content: Player[];
  // Add other pagination properties if your API returns them
  // page: number;
  // size: number;
  // totalElements: number;
  // totalPages: number;
}
import { type Player } from '../../types/Player';
import { useNavigate } from 'react-router-dom';

function AdminIPL() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({ name: '', category: 'league', leagueName: 'Indian Premier League (IPL)', country: 'India', gender: 'male' });
  const [newMatch, setNewMatch] = useState<Partial<Match>>({ 
    title: '', 
    tournament: 'IPL', 
    matchType: 'T20',
    team1: '',
    team2: '',
    venue: '',
    dateTimeGMT: ''
  });
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({ name: '', country: 'India', gender: 'male', role: 'batsman' });
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({ teams: true, matches: true, players: true });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Define the API response type
        interface TeamsApiResponse {
          content: Team[];
          // Add other pagination fields if your API returns them
          // page: number;
          // size: number;
          // totalElements: number;
          // totalPages: number;
        }

        // Fetch IPL teams with proper typing
        const teamsResponse = await axios.get<TeamsApiResponse>(
          `${import.meta.env.VITE_API_URL}/teams/ipl`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { category: 'league', leagueName: 'Indian Premier League (IPL)' },
          }
        );
        setTeams(teamsResponse.data.content);

        // Fetch IPL matches
        const matchesResponse = await axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/tournament/IPL`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(matchesResponse.data);

        // Fetch IPL players
        const playersResponse = await axios.get<Player[]>(`${import.meta.env.VITE_API_URL}/players`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { category: 'league', leagueName: 'Indian Premier League (IPL)' },
        });
        setPlayers(playersResponse.data);

        setError(null);
      } catch (err) {
        setError('Failed to fetch IPL admin data.');
        console.error(err);
      } finally {
        setLoading({ teams: false, matches: false, players: false });
      }
    };

    fetchData();
  }, [navigate]);

  const handleCreateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append('team', JSON.stringify(newTeam));
      if (teamLogo) formData.append('logoFile', teamLogo);
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/teams`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
      });
      setNewTeam({ name: '', category: 'league', leagueName: 'Indian Premier League (IPL)', country: 'India', gender: 'male' });
      setTeamLogo(null);
      setError(null);
      // Refresh teams
      const teamsResponse = await axios.get<TeamsResponse>(`${import.meta.env.VITE_API_URL}/teams/ipl`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { category: 'league', leagueName: 'Indian Premier League (IPL)' },
      });
      setTeams(teamsResponse.data.content);
    } catch (err) {
      setError('Failed to create team.');
      console.error(err);
    }
  };

  const handleCreateMatch = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/matches`, 
        {
          ...newMatch,
          team1: teams.find(t => t.id === newMatch.team1),
          team2: teams.find(t => t.id === newMatch.team2)
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        }
      );
      setNewMatch({ 
        title: '', 
        tournament: 'IPL', 
        matchType: 'T20',
        team1: '',
        team2: '',
        venue: '',
        dateTimeGMT: ''
      });
      setError(null);
      // Refresh matches
      const matchesResponse = await axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/tournament/IPL`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMatches(matchesResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create match.');
      console.error(err);
    }
  };

  const handleCreatePlayer = async () => {
    try {
      const formData = new FormData();
      const playerData = {
        ...newPlayer,
        leagues: newPlayer.leagues || []
      };
      formData.append('player', JSON.stringify(playerData));
      if (playerPhoto) formData.append('profileImage', playerPhoto);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/players`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`, 
            'Content-Type': 'multipart/form-data' 
          },
        }
      );
      
      setNewPlayer({ 
        name: '', 
        country: 'India', 
        gender: 'male', 
        role: 'batsman',
        leagues: []
      });
      setPlayerPhoto(null);
      setError(null);
      
      // Refresh players
      const playersResponse = await axios.get<PlayersResponse>(`${import.meta.env.VITE_API_URL}/players/ipl`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { category: 'league', leagueName: 'Indian Premier League (IPL)' },
      });
      setPlayers(playersResponse.data.content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create player.');
      console.error(err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/teams/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTeams(teams.filter((team) => team.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete team.');
      console.error(err);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMatches(matches.filter((match) => match.matchId !== matchId));
      setError(null);
    } catch (err) {
      setError('Failed to delete match.');
      console.error(err);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/players/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPlayers(players.filter((player) => player.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete player.');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-100">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        IPL Admin Dashboard
      </motion.h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Teams Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Manage IPL Teams</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="teamLogo">Team Logo</Label>
              <Input
                id="teamLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <Button onClick={handleCreateTeam} className="mt-4 bg-purple-600 hover:bg-purple-700">
            Create Team
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading.teams ? (
            <div>Loading teams...</div>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={team.logoUrl} alt={team.name} className="w-12 h-12 object-contain" />
                  <span>{team.name}</span>
                </div>
                <Button variant="destructive" onClick={() => handleDeleteTeam(team.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Matches Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Manage IPL Matches</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h3 className="text-lg font-semibold mb-4">Add New Match</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matchTitle">Match Title</Label>
              <Input
                id="matchTitle"
                value={newMatch.title}
                onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
                placeholder="Enter match title"
              />
            </div>
            <div>
              <Label htmlFor="team1Id">Team 1</Label>
              <select
                id="team1Id"
                value={newMatch.team1}
                onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                className="border rounded p-2 w-full"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="team2Id">Team 2</Label>
              <select
                id="team2Id"
                value={newMatch.team2}
                onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                className="border rounded p-2 w-full"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={newMatch.venue}
                onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                placeholder="Enter venue"
              />
            </div>
            <div>
              <Label htmlFor="dateTimeGMT">Date & Time (GMT)</Label>
              <Input
                id="dateTimeGMT"
                type="datetime-local"
                value={newMatch.dateTimeGMT || ''}
                onChange={(e) => setNewMatch({ ...newMatch, dateTimeGMT: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleCreateMatch} className="mt-4 bg-purple-600 hover:bg-purple-700">
            Create Match
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading.matches ? (
            <div>Loading matches...</div>
          ) : (
            matches.map((match) => (
              <div key={match.matchId} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <span>{match.title}</span>
                  <p className="text-sm text-gray-500">{match.venue} - {new Date(match.dateTimeGMT || '').toLocaleString()}</p>
                </div>
                <Button variant="destructive" onClick={() => handleDeleteMatch(match.matchId)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Players Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage IPL Players</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h3 className="text-lg font-semibold mb-4">Add New Player</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="Enter player name"
              />
            </div>
            <div>
              <Label htmlFor="playerPhoto">Player Photo</Label>
              <Input
                id="playerPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => setPlayerPhoto(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={newPlayer.role}
                onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value as any })}
                className="border rounded p-2 w-full"
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">Allrounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
              </select>
            </div>
          </div>
          <Button onClick={handleCreatePlayer} className="mt-4 bg-purple-600 hover:bg-purple-700">
            Create Player
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading.players ? (
            <div>Loading players...</div>
          ) : (
            players.map((player) => (
              <div key={player.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full" />
                  <span>{player.name} ({player.role})</span>
                </div>
                <Button variant="destructive" onClick={() => handleDeletePlayer(player.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminIPL;