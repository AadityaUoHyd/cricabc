import { useState, useEffect } from 'react';
import axios from 'axios';
import { type Venue, type VenueFormData } from '../../types/Venue';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '@radix-ui/react-label';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function AdminVenue() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenueId, setCurrentVenueId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<VenueFormData>({
    stadiumName: '',
    city: '',
    country: '',
    capacity: '',
    location: '',
    imageUrl: '',
    description: '',
    establishedYear: '',
    matchesHosted: '0'
  });

  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Venue[]>(`${import.meta.env.VITE_API_URL}/venues`);
      setVenues(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      stadiumName: '',
      city: '',
      country: '',
      capacity: '',
      location: '',
      imageUrl: '',
      description: '',
      establishedYear: '',
      matchesHosted: '0'
    });
    setIsEditing(false);
    setCurrentVenueId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    const venueData = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
      matchesHosted: formData.matchesHosted ? parseInt(formData.matchesHosted) : 0
    };

    try {
      if (isEditing && currentVenueId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/venues/${currentVenueId}`,
          venueData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/venues`,
          venueData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      resetForm();
      setIsFormOpen(false);
      fetchVenues();
    } catch (err) {
      console.error('Error saving venue:', err);
      setError('Failed to save venue. Please try again.');
    }
  };

  const handleEdit = (venue: Venue) => {
    setFormData({
      stadiumName: venue.stadiumName,
      city: venue.city,
      country: venue.country,
      capacity: venue.capacity?.toString() || '',
      location: venue.location || '',
      imageUrl: venue.imageUrl || '',
      description: venue.description || '',
      establishedYear: venue.establishedYear?.toString() || '',
      matchesHosted: venue.matchesHosted?.toString() || '0'
    });
    setCurrentVenueId(venue.id || null);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/venues/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVenues();
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError('Failed to delete venue. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading venues...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Venues</h1>
        <Button onClick={() => {
          resetForm();
          setIsFormOpen(true);
        }}>
          <FiPlus className="mr-2" /> Add New Venue
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Venue' : 'Add New Venue'}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsFormOpen(false);
              resetForm();
            }}>
              <FiX />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stadiumName">Stadium Name *</Label>
                <Input
                  id="stadiumName"
                  name="stadiumName"
                  value={formData.stadiumName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Address)</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input
                  id="establishedYear"
                  name="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="matchesHosted">Matches Hosted</Label>
                <Input
                  id="matchesHosted"
                  name="matchesHosted"
                  type="number"
                  value={formData.matchesHosted}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full p-2 border rounded-md"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Venue' : 'Add Venue'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stadium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No venues found. Add your first venue to get started.
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {venue.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={venue.imageUrl} alt={venue.stadiumName} />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{venue.stadiumName}</div>
                          <div className="text-sm text-gray-500">{venue.city}, {venue.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venue.location || 'N/A'}</div>
                      {venue.establishedYear && (
                        <div className="text-sm text-gray-500">Est. {venue.establishedYear}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venue.capacity ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {venue.capacity.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venue.matchesHosted || 0} matches
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(venue)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FiEdit2 className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => venue.id && handleDelete(venue.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
