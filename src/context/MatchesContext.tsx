import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { Match } from '../types/Match';

interface MatchesContextType {
  matches: Match[];
  loading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  updateMatch: (id: string, matchData: Partial<Match>) => Promise<void>;
  createMatch: (matchData: Omit<Match, 'id'>) => Promise<Match>;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const MatchesProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(data as Match[]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(matches.filter(match => match.id !== id));
    } catch (err) {
      console.error('Error deleting match:', err);
      throw err;
    }
  };

  const updateMatch = async (id: string, matchData: Partial<Match>) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put<Match>(
        `${import.meta.env.VITE_API_URL}/matches/${id}`,
        matchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches(matches.map(match => (match.id === id ? data : match)));
    } catch (err) {
      console.error('Error updating match:', err);
      throw err;
    }
  };

  const createMatch = async (matchData: Omit<Match, 'id'>): Promise<Match> => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/matches`,
        matchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMatch = data as Match;
      setMatches([...matches, newMatch]);
      return newMatch;
    } catch (err) {
      console.error('Error creating match:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch matches if we don't have any data yet
    if (matches.length === 0 && !loading) {
      fetchMatches();
    }
  }, [matches.length, loading]); // Add dependencies to prevent unnecessary re-fetches

  return (
    <MatchesContext.Provider 
      value={{ 
        matches, 
        loading, 
        error, 
        fetchMatches, 
        deleteMatch, 
        updateMatch, 
        createMatch 
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = (): MatchesContextType => {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};

export default MatchesContext;
