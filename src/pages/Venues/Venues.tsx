import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import type { Venue } from '../../types/Venue';
import './Venues.css';

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // Removed debug log
        const response = await axios.get<Venue[]>(`${import.meta.env.VITE_API_URL}/venues`);
        // Removed debug log
        
        // Log the first venue to check its structure
        if (response.data && response.data.length > 0) {
          // Removed debug log
        }
        
        const sortedVenues = [...response.data].sort((a, b) => 
          a.stadiumName.localeCompare(b.stadiumName)
        );
        
        setVenues(sortedVenues);
      } catch (err) {
        const errorMsg = err instanceof Error 
          ? `Failed to fetch venues: ${err.message}`
          : 'Failed to fetch venues. Please try again later.';
        setError(errorMsg);
        console.error('Error fetching venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Group venues by country
  const venuesByCountry = venues.reduce<Record<string, Venue[]>>((acc, venue) => {
    if (!acc[venue.country]) {
      acc[venue.country] = [];
    }
    acc[venue.country].push(venue);
    return acc;
  }, {});

  const countries = Object.keys(venuesByCountry).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Cricket Venues</h1>
        
        {/* Country Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCountry(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCountry 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Countries
          </button>
          
          {countries.map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCountry === country
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {country}
            </button>
          ))}
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {venues
              .filter(venue => !selectedCountry || venue.country === selectedCountry)
              .map((venue) => (
                <motion.div
                  key={venue._id || `venue-${venue.stadiumName}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => {
                    // Removed debug log
                    const venueId = venue._id || venue.id;
                    // Removed debug log
                    
                    if (!venueId) {
                      console.error('No ID found for venue:', venue);
                      setError(`No ID found for venue: ${venue.stadiumName}`);
                      return;
                    }
                    
                    // Removed debug log
                    navigate(`/venues/${venueId}`);
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={venue.imageUrl || 'https://via.placeholder.com/400x200?text=Stadium+Image'}
                      alt={venue.stadiumName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{venue.stadiumName}</h3>
                      <div className="flex items-center text-white/90 text-sm mt-1">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{venue.city}, {venue.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-2 text-purple-500" />
                        <span>{venue.capacity?.toLocaleString()} capacity</span>
                      </div>
                      {venue.matchesHosted && (
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="mr-2 text-green-500" />
                          <span>{venue.matchesHosted} matches</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {venue.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center text-purple-600 font-medium cursor-pointer group">
                      <span>View Details</span>
                      <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Venues;
