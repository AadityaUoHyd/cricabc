import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { type Video } from '../../types/Video';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Edit2, Trash2, Youtube } from 'lucide-react';

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<Video>({ id: '', title: '', url: '', description: '', createdAt: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/videos`, {
        params: { page, size: 5 },
      });
      setVideos(response.data as Video[]);
      setTotalPages(Number(response.headers['x-total-pages']) || 1);
      setTotalItems(Number(response.headers['x-total-elements']) || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);

    const formData = new FormData();
    const videoPayload = {
      title: form.title,
      url: form.url,
      description: form.description
    };
    formData.append('video', new Blob([JSON.stringify(videoPayload)], { type: 'application/json' }));
    if (videoFile) {
      formData.append('file', videoFile);
    }

    // Debug FormData - removed

    try {
      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/videos/${form.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`
            // Let browser set Content-Type with boundary
          },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/videos`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`
          },
        });
      }
      fetchVideos();
      setForm({ id: '', title: '', url: '', description: '', createdAt: '' });
      setVideoFile(null);
      setError(null);
    } catch (err) {
      setError('Failed to save video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: Video) => {
    setForm(video);
    setVideoFile(null);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVideos();
      setError(null);
    } catch (err) {
      setError('Failed to delete video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-4xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">Manage Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-black">
                Title
              </Label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="url" className="text-sm font-medium text-black">
                Video URL (Optional if uploading)
              </Label>
              <input
                id="url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                placeholder="https://www.youtube.com/watch?v=... or leave blank for upload"
              />
            </div>
            <div>
              <Label htmlFor="videoFile" className="text-sm font-medium text-black">
                Upload Video (Optional)
              </Label>
              <input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-black">
                Description
              </Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                rows={5}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              {form.id ? 'Update Video' : 'Create Video'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="shadow-sm">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
              <div className="flex items-center space-x-4">
                <Youtube className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-600 line-clamp-2">{video.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{video.description}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(video)}
                  disabled={loading}
                  className="text-purple-600 border-purple-600 text-xs sm:text-sm"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  disabled={loading}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalItems > 5 && (
        <div className="mt-6 flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 self-center">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
