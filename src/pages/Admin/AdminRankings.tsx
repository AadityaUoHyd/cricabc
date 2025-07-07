import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { type Player } from '../../types/Player';

export default function AdminRankings() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rankings, setRankings] = useState<{ [playerId: string]: { testRank: number; odiRank: number; t20Rank: number; testRating: number; odiRating: number; t20Rating: number } }>({});

  useEffect(() => {
    fetchPlayers();
  }, [page]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/players`, {
        params: { teamId: '', category: 'international', page, size: 10 },
      });
      setPlayers(response.data as Player[]);
      setTotalPages(Number(response.headers['x-total-pages']) || 1);
      setError(null);
      // Initialize rankings state
      const initialRankings = (response.data as Player[]).reduce((acc: any, player: Player) => ({
        ...acc,
        [player.id]: {
          testRank: player.ranking?.testRank || 0,
          odiRank: player.ranking?.odiRank || 0,
          t20Rank: player.ranking?.t20Rank || 0,
          testRating: player.ranking?.testRating || 0,
          odiRating: player.ranking?.odiRating || 0,
          t20Rating: player.ranking?.t20Rating || 0,
        },
      }), {});
      setRankings(initialRankings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch players');
      console.error('Fetch players error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRankingChange = (playerId: string, field: string, value: number) => {
    setRankings((prev: { [x: string]: any; }) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (playerId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }
    setLoading(true);
    try {
      const player = players.find((p: { id: string; }) => p.id === playerId);
      if (!player) throw new Error('Player not found');
      const updatedPlayer = {
        ...player,
        ranking: rankings[playerId],
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/players/${playerId}`, 
        { player: updatedPlayer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update rankings');
      console.error('Update rankings error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-4xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">Manage Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          {players.length === 0 && !loading && (
            <p className="text-center text-gray-600">No players found.</p>
          )}
          <div className="space-y-4">
            {players.map((player) => (
              <Card key={player.id} className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">{player.name} ({player.country})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`testRank-${player.id}`}>Test Rank</Label>
                      <input
                        id={`testRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`testRating-${player.id}`}>Test Rating</Label>
                      <input
                        id={`testRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiRank-${player.id}`}>ODI Rank</Label>
                      <input
                        id={`odiRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiRating-${player.id}`}>ODI Rating</Label>
                      <input
                        id={`odiRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20Rank-${player.id}`}>T20 Rank</Label>
                      <input
                        id={`t20Rank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20Rank || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20Rank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20Rating-${player.id}`}>T20 Rating</Label>
                      <input
                        id={`t20Rating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20Rating || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20Rating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSubmit(player.id)}
                    disabled={loading}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  >
                    Update Rankings
                  </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}