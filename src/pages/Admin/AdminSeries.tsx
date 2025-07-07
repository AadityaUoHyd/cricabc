import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { type Series } from '../../types/Series';

export default function AdminSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [form, setForm] = useState<Series>({ id: '', name: '', startDate: '', endDate: '', teams: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/series`);
      setSeriesList(response.data as Series[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch series');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/series/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/series`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchSeries();
      setForm({ id: '', name: '', startDate: '', endDate: '', teams: '' });
      setError(null);
    } catch (err) {
      setError('Failed to save series');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (series: Series) => {
    setForm({
      ...series,
      startDate: series.startDate ? new Date(series.startDate).toISOString().slice(0, 16) : '',
      endDate: series.endDate ? new Date(series.endDate).toISOString().slice(0, 16) : '',
    });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/series/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSeries();
      setError(null);
    } catch (err) {
      setError('Failed to delete series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Manage Series</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-purple-600 mb-4">Loading...</p>}
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
            value={form.teams}
            onChange={(e) => setForm({ ...form, teams: e.target.value })}
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
              <p className="text-sm text-gray-600">{series.teams}</p>
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