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
  const [rankings, setRankings] = useState<{ [playerId: string]: { 
    testBattingRank: number; odiBattingRank: number; t20BattingRank: number; testBattingRating: number; odiBattingRating: number; t20BattingRating: number,
    testBowlingRank: number; odiBowlingRank: number; t20BowlingRank: number; testBowlingRating: number; odiBowlingRating: number; t20BowlingRating: number,
    testAllrounderRank: number; odiAllrounderRank: number; t20AllrounderRank: number; testAllrounderRating: number; odiAllrounderRating: number; t20AllrounderRating: number
  } }>({});

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
          testBattingRank: player.ranking.testBattingRank || 0,
          odiBattingRank: player.ranking.odiBattingRank || 0,
          t20BattingRank: player.ranking.t20BattingRank || 0,
          testBattingRating: player.ranking.testBattingRating || 0,
          odiBattingRating: player.ranking.odiBattingRating || 0,
          t20BattingRating: player.ranking.t20BattingRating || 0,
          testBowlingRank: player.ranking.testBowlingRank || 0,
          odiBowlingRank: player.ranking.odiBowlingRank || 0,
          t20BowlingRank: player.ranking.t20BowlingRank || 0,
          testBowlingRating: player.ranking.testBowlingRating || 0,
          odiBowlingRating: player.ranking.odiBowlingRating || 0,
          t20BowlingRating: player.ranking.t20BowlingRating || 0,
          testAllrounderRank: player.ranking.testAllrounderRank || 0,
          odiAllrounderRank: player.ranking.odiAllrounderRank || 0,
          t20AllrounderRank: player.ranking.t20AllrounderRank || 0,
          testAllrounderRating: player.ranking.testAllrounderRating || 0,
          odiAllrounderRating: player.ranking.odiAllrounderRating || 0,
          t20AllrounderRating: player.ranking.t20AllrounderRating || 0,
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
                      <Label htmlFor={`testBattingRank-${player.id}`}>Test Batting Rank</Label>
                      <input
                        id={`testBattingRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testBattingRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testBattingRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`testBattingRating-${player.id}`}>Test Batting Rating</Label>
                      <input
                        id={`testBattingRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testBattingRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testBattingRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiBattingRank-${player.id}`}>ODI Batting Rank</Label>
                      <input
                        id={`odiBattingRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiBattingRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiBattingRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiBattingRating-${player.id}`}>ODI Batting Rating</Label>
                      <input
                        id={`odiBattingRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiBattingRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiBattingRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20BattingRank-${player.id}`}>T20 Batting Rank</Label>
                      <input
                        id={`t20BattingRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20BattingRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20BattingRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20BattingRating-${player.id}`}>T20 Batting Rating</Label>
                      <input
                        id={`t20BattingRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20BattingRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20BattingRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`testBowlingRank-${player.id}`}>Test Bowling Rank</Label>
                      <input
                        id={`testBowlingRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testBowlingRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testBowlingRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                  </div>
                  <div>
                    <Label htmlFor={`testBowlingRating-${player.id}`}>Test Bowling Rating</Label>
                    <input
                      id={`testBowlingRating-${player.id}`}
                      type="number"
                      value={rankings[player.id]?.testBowlingRating || 0}
                      onChange={(e) => handleRankingChange(player.id, 'testBowlingRating', Number(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`odiBowlingRank-${player.id}`}>ODI Bowling Rank</Label>
                    <input
                      id={`odiBowlingRank-${player.id}`}
                      type="number"
                      value={rankings[player.id]?.odiBowlingRank || 0}
                      onChange={(e) => handleRankingChange(player.id, 'odiBowlingRank', Number(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                    </div>
                  <div>
                    <Label htmlFor={`odiBowlingRating-${player.id}`}>ODI Bowling Rating</Label>
                    <input
                      id={`odiBowlingRating-${player.id}`}
                      type="number"
                      value={rankings[player.id]?.odiBowlingRating || 0}
                      onChange={(e) => handleRankingChange(player.id, 'odiBowlingRating', Number(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`t20BowlingRank-${player.id}`}>T20 Bowling Rank</Label>
                    <input
                      id={`t20BowlingRank-${player.id}`}
                      type="number"
                      value={rankings[player.id]?.t20BowlingRank || 0}
                      onChange={(e) => handleRankingChange(player.id, 't20BowlingRank', Number(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                    </div>
                    <div>
                      <Label htmlFor={`t20BowlingRating-${player.id}`}>T20 Bowling Rating</Label>
                      <input
                        id={`t20BowlingRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20BowlingRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20BowlingRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`testAllrounderRank-${player.id}`}>Test Allrounder Rank</Label>
                      <input
                        id={`testAllrounderRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testAllrounderRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testAllrounderRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`testAllrounderRating-${player.id}`}>Test Allrounder Rating</Label>
                      <input
                        id={`testAllrounderRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.testAllrounderRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'testAllrounderRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiAllrounderRank-${player.id}`}>ODI Allrounder Rank</Label>
                      <input
                        id={`odiAllrounderRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiAllrounderRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiAllrounderRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`odiAllrounderRating-${player.id}`}>ODI Allrounder Rating</Label>
                      <input
                        id={`odiAllrounderRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.odiAllrounderRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 'odiAllrounderRating', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20AllrounderRank-${player.id}`}>T20 Allrounder Rank</Label>
                      <input
                        id={`t20AllrounderRank-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20AllrounderRank || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20AllrounderRank', Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`t20AllrounderRating-${player.id}`}>T20 Allrounder Rating</Label>
                      <input
                        id={`t20AllrounderRating-${player.id}`}
                        type="number"
                        value={rankings[player.id]?.t20AllrounderRating || 0}
                        onChange={(e) => handleRankingChange(player.id, 't20AllrounderRating', Number(e.target.value))}
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