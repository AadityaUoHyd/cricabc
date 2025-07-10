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
      const res = await axios.get<Player[]>(
        `${import.meta.env.VITE_API_URL || ''}/api/players`, 
        { 
          params: { 
            page: 0, 
            size: 1000 
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      setPlayers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to fetch players. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching players:', err);
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
