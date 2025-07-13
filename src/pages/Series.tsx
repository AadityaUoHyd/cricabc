import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { Series as SeriesType } from '../types/Series';

// Extend the Series type to handle both string[] and string for teams
interface CustomSeries extends Omit<SeriesType, 'teams'> {
  teams: string[] | string;
}

interface SeriesCardProps {
  series: CustomSeries;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  // Safely handle teams whether they're an array or comma-separated string
  const teamNames: string[] = (() => {
    if (!series.teams) return [];
    if (Array.isArray(series.teams)) return series.teams;
    if (typeof series.teams === 'string') {
      return series.teams.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  })();
  
  // Format date
  const formatDate = (dateInput: string | Date): string => {
    if (!dateInput) return 'N/A';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Get cricket-related background color based on series name
  const getSeriesTheme = (name: string): string => {
    const themes = [
      'from-green-500 to-emerald-700',
      'from-blue-500 to-cyan-700',
      'from-purple-500 to-indigo-700',
      'from-amber-500 to-yellow-700',
      'from-rose-500 to-pink-700',
      'from-gray-500 to-pink-700'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return themes[hash % themes.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getSeriesTheme(series.name)} p-4 text-white`}>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold pr-2">{series.name}</h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold inline-block">
            Teams={teamNames.length}
          </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-white/90">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(series.startDate)} - {formatDate(series.endDate)}</span>
        </div>
      </div>
      
      {/* Teams */}
      <div className="p-4">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Participating Teams</h4>
          <div className="flex flex-wrap gap-2">
            {teamNames.map((team, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {team}
              </span>
            ))}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-500">
              {new Date(series.endDate).getTime() > Date.now() ? 'Ongoing' : 'Completed'}
            </span>
          </div>
          <button className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Series() {
  const [series, setSeries] = useState<CustomSeries[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSeries = useCallback(async () => {
    try {
      // Ensure we don't have double /api in the URL
      const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
        ? import.meta.env.VITE_API_URL.slice(0, -1) 
        : import.meta.env.VITE_API_URL;
      const response = await axios.get<CustomSeries[]>(`${baseUrl}/series`);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-purple-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Cricket Series
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore the latest cricket series from around the world
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              placeholder="Search cricket series..."
            />
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {['All', 'International', 'League', 'Domestic'].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  type === 'All' 
                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Series Grid */}
        {filteredSeries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No series found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSeries.map((seriesItem) => (
              <motion.div
                key={seriesItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <SeriesCard series={seriesItem} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}