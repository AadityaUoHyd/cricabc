import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import type { Series } from '../../types/Series';

export default function AdminSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [form, setForm] = useState<Omit<Series, 'id'> & { id: string | '' }>({ 
    id: '', 
    name: '', 
    startDate: '', 
    endDate: '',
    teams: '' 
  });
  const [teamsInput, setTeamsInput] = useState(''); // For form input
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!import.meta.env.VITE_API_URL) {
        throw new Error('API URL is not configured');
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Ensure we don't have double /api in the URL
      const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
        ? import.meta.env.VITE_API_URL.slice(0, -1) 
        : import.meta.env.VITE_API_URL;
      const response = await axios.get<Series[]>(`${baseUrl}/admin/series`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        setSeriesList(response.data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Fetch series error:', error);
      const axiosError = error as any;
      const errorMessage = 
        (axiosError.response?.data?.message) || 
        (axiosError.message) || 
        'Failed to fetch series. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!import.meta.env.VITE_API_URL) {
      setError('API URL is not configured');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
        ? import.meta.env.VITE_API_URL.slice(0, -1) 
        : import.meta.env.VITE_API_URL;
      const url = form.id 
        ? `${baseUrl}/admin/series/${form.id}`
        : `${baseUrl}/admin/series`;
      
      const method = form.id ? 'put' : 'post';
      
      // Prepare the data to match backend model
      const seriesData = {
        id: form.id || undefined, // Let MongoDB generate ID for new records
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        teams: teamsInput // Use the raw teams string
      };
      
      await axios[method](url, seriesData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Reset form and refresh list
      setForm({
        id: '',
        name: '',
        startDate: '',
        endDate: '',
        teams: ''
      });
      setTeamsInput('');
      fetchSeries();
      
    } catch (err) {
      console.error('Error saving series:', err);
      setError('Failed to save series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (series: Series) => {
    setForm({
      id: series.id,
      name: series.name,
      startDate: series.startDate,
      endDate: series.endDate,
      teams: series.teams
    });
    setTeamsInput(series.teams);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this series?')) return;
    
    if (!import.meta.env.VITE_API_URL) {
      setError('API URL is not configured');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }
    
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
        ? import.meta.env.VITE_API_URL.slice(0, -1) 
        : import.meta.env.VITE_API_URL;
      await axios.delete(`${baseUrl}/admin/series/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the series list
      await fetchSeries();
      
    } catch (error) {
      console.error('Delete series error:', error);
      setError('Failed to delete series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamsInput(value);
    
    // Update form with team names as a comma-separated string
    setForm(prev => ({
      ...prev,
      teams: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
              <button 
                onClick={fetchSeries}
                className="ml-2 text-sm font-medium text-red-700 underline hover:text-red-600"
              >
                Retry
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Manage Series</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Series Name
          </Label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </Label>
          <input
            id="startDate"
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </Label>
          <input
            id="endDate"
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="teams" className="block text-sm font-medium text-gray-700">
            Teams (Comma-separated)
          </Label>
          <input
            id="teams"
            type="text"
            value={teamsInput}
            onChange={handleTeamsInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-400"
        >
          {form.id ? 'Update Series' : 'Create Series'}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4">
        {seriesList.map((series) => (
          <div key={series.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{series.name}</h3>
              <p className="text-sm text-gray-600">
                {series.teams || 'No teams'}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(series.startDate).toLocaleDateString()} - {new Date(series.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(series)} className="text-purple-600 hover:underline" disabled={loading}>
                Edit
              </button>
              <button
                onClick={() => handleDelete(series.id)}
                className="text-red-600 hover:underline"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}