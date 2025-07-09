import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Player } from '../types/Player';
import axios from 'axios';

interface PlayerContextType {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  refreshPlayers: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Player[]>(`/api/players`, { params: { page: 0, size: 1000 } });
      setPlayers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch players');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlayers();
  }, []);

  return (
    <PlayerContext.Provider value={{ players, setPlayers, refreshPlayers, loading, error }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayers must be used within a PlayerProvider');
  return context;
};
