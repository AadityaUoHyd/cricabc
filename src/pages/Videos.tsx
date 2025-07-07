import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { type Video } from '../types/Video';
import LazyLoad from 'react-lazyload';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Video[]>(`${import.meta.env.VITE_API_URL}/videos`, {
          params: { page, size: 20 },
        });
        setVideos(response.data);
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
    fetchVideos();
  }, [page]);

  // Extract video ID for Cloudinary or YouTube
  const getVideoThumbnail = (url: string): string => {
    try {
      // Check if Cloudinary video
      if (url.includes('cloudinary.com')) {
        // Replace video extension with .jpg for thumbnail
        return url.replace(/\.(mp4|webm|ogg)$/, '.jpg');
      }
      // Check if YouTube video
      const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder.jpg';
    } catch {
      return '/placeholder.jpg';
    }
  };

  const getVideoEmbedUrl = (url: string): string => {
    if (url.includes('cloudinary.com')) {
      return url; // Cloudinary videos can be used directly
    }
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  // Hero: latest video; Sidebar: all others
  const latestVideo = videos.length > 0 ? videos[0] : null;
  const sidebarVideos = videos.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-8 text-center text-purple-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Cricket Videos
        </motion.h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-purple-600 text-center mb-4">Loading...</p>}
        {!loading && videos.length === 0 && (
          <p className="text-center text-gray-600">No videos available yet.</p>
        )}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Hero Section */}
          <div className="flex-1">
            {latestVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[300px] sm:h-[500px]">
                      <iframe
                        src={getVideoEmbedUrl(latestVideo.url)}
                        title={latestVideo.title}
                        className="w-full h-full rounded-t-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl sm:text-2xl font-semibold text-purple-600 line-clamp-2">{latestVideo.title}</h2>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{latestVideo.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
          {/* Sidebar */}
          <div className="lg:w-80">
            <h2 className="text-lg font-semibold text-purple-800 mb-4 text-center">Recent Videos</h2>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              {sidebarVideos.length === 0 && !loading && (
                <p className="text-sm text-gray-600">No recent videos available.</p>
              )}
              {sidebarVideos.map((video) => (
                <LazyLoad key={video.id} height={100} offset={100}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="flex items-center p-3">
                        <img
                          src={getVideoThumbnail(video.url)}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded-md mr-3"
                        />
                        <div>
                          <a href={getVideoEmbedUrl(video.url)}>
                            <h3 className="text-sm font-semibold text-purple-600 line-clamp-2">{video.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{video.description}</p>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </LazyLoad>
              ))}
            </div>
            {totalItems > 20 && (
              <div className="mt-4 flex justify-between space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="text-purple-600 border-purple-600 text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600 self-center">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="text-purple-600 border-purple-600 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}