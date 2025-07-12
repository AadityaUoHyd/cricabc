import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaArrowLeft, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { Venue } from '../../types/Venue';
import './VenueDetail.css';

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenue = async () => {
      // Removed debug log
      
      if (!id) {
        const errorMsg = 'No venue ID provided in the URL';
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      try {
        const url = `${import.meta.env.VITE_API_URL}/venues/${id}`;
        // Removed debug log
        
        const response = await axios.get<Venue>(url, {
          validateStatus: (status) => status < 500 // Don't throw for 404
        });
        
        // Removed debug log
        // Removed debug log
        
        if (response.status === 404) {
          throw new Error('Venue not found');
        }
        
        if (!response.data) {
          throw new Error('No data returned from server');
        }
        
        setVenue(response.data);
      } catch (error) {
        let errorMsg = 'Failed to fetch venue details. Please try again later.';
        
        // Check if error is an object with the expected properties
        if (error && typeof error === 'object') {
          const err = error as Record<string, any>;
          
          // Check if it's an axios error response
          if (err.response) {
            const { status, data } = err.response;
            console.error('Error response:', { status, data });
            
            if (status === 404) {
              errorMsg = 'Venue not found. It may have been removed or the URL is incorrect.';
            } else if (data?.message) {
              errorMsg = `Error: ${data.message}`;
            } else if (status) {
              errorMsg = `Server responded with status: ${status}`;
            }
          } 
          // Check if it's a request error (no response)
          else if (err.request) {
            console.error('No response received:', err.request);
            errorMsg = 'No response from server. Please check your connection.';
          }
          // Check for error message
          else if (err.message) {
            console.error('Request error:', err.message);
            errorMsg = `Error: ${err.message}`;
          }
        }
        // Handle standard Error objects
        else if (error instanceof Error) {
          console.error('Error details:', error);
          errorMsg = error.message;
        }
        // Handle any other type of error
        else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-red-500 text-lg mb-4">{error || 'Venue not found'}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Venues
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Venues
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Image */}
          <div className="relative h-full">
            <img
              src={venue.imageUrl || 'https://via.placeholder.com/1200x500?text=Stadium+Image'}
              alt={venue.stadiumName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h1 className="text-4xl font-bold text-white">{venue.stadiumName}</h1>
              <div className="flex items-center text-white/90 mt-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>{venue.city}, {venue.country}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Details */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">About {venue.stadiumName}</h2>
                <p className="text-gray-700 mb-6">{venue.description || 'No description available.'}</p>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">Stadium Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FaUsers className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{venue.capacity?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Matches Hosted</p>
                        <p className="font-medium">{venue.matchesHosted || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FaCalendarAlt className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Established</p>
                        <p className="font-medium">{venue.establishedYear || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <FaGlobe className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{venue.location || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Map Placeholder */}
              <div className="bg-gray-100 rounded-lg overflow-hidden h-64 md:h-auto">
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center p-4">
                    <FaMapMarkerAlt className="text-4xl mx-auto mb-2" />
                    <p>Map view coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueDetail;
