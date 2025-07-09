import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import type { Series } from '../types/Series';

interface SeriesCardProps {
  series: Series;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  // Parse teams from comma-separated string
  const teamNames = series.teams ? series.teams.split(',').map(t => t.trim()) : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{series.name}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-1">📅</span>
          <span>
            {series.startDate} - {series.endDate}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-2">
            {teamNames.slice(0, 3).map((team, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700"
                title={team}
              >
                {team.charAt(0).toUpperCase()}
              </div>
            ))}
            {teamNames.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                +{teamNames.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Series() {
  const [series, setSeries] = useState<Series[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSeries = useCallback(async () => {
    try {
      // Ensure we don't have double /api in the URL
      const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
        ? import.meta.env.VITE_API_URL.slice(0, -1) 
        : import.meta.env.VITE_API_URL;
      const response = await axios.get<Series[]>(`${baseUrl}/series`);
      setSeries(response.data);
    } catch (err) {
      console.error('Error fetching series:', err);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const filteredSeries = series.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-2">
          Cricket Series
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Browse through all the latest cricket series from around the world
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select 
              value="all"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="International">International</option>
              <option value="League">League</option>
              <option value="Domestic">Domestic</option>
            </select>
            <select 
              value="all"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {filteredSeries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No series found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((seriesItem) => (
            <motion.div
              key={seriesItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <SeriesCard series={seriesItem} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}