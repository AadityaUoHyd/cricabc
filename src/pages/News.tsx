import { useEffect, useState } from 'react';
import axios from 'axios';
import { initPusher } from '../lib/pusher';
import { Link } from 'react-router-dom';
import { format, toDate } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { type News } from '../types/News';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { GiCricketBat } from "react-icons/gi";

export default function News() {
  const [news, setNews] = useState<News[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    axios
      .get<News[]>(`${import.meta.env.VITE_API_URL}/news`, {
        params: { page, size: page === 0 ? 53 : 50 }, // Fetch 53 items on first page, 50 thereafter
      })
      .then((response) => {
        setNews(response.data);
        setTotalPages(Math.ceil((response.headers['x-total-elements'] - 53) / 50) + 1 || 1);
        setTotalItems(Number(response.headers['x-total-elements']) || 0);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch news.');
        console.error(err);
      });

    const pusher = initPusher();
    const channel = pusher.subscribe('news-channel');
    channel.bind('news-update', (data: News) => {
      setNews((prev) => {
        const exists = prev.find((item) => item.id === data.id);
        if (exists) {
          return prev.map((item) => (item.id === data.id ? data : item));
        }
        return [data, ...prev];
      });
    });
    channel.bind('news-deleted', (id: string) => {
      setNews((prev) => prev.filter((item) => item.id !== id));
    });

    return () => {
      pusher.unsubscribe('news-channel');
    };
  }, [page]);

  // Split news into top 3 and next 50
  const topThree = news.slice(0, 3);
  const nextFifty = news.slice(3, 53);

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-100 min-h-screen">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="flex items-center justify-center"><GiCricketBat className="mr-2" />Cricket News</span>
      </motion.h1>
      {error && <p className="text-red-500 mb-4 sm:mb-6 text-center text-sm sm:text-base">{error}</p>}
      {news.length === 0 && !error && <p className="text-center text-gray-600 text-sm sm:text-base">Loading news...</p>}

      {/* Top 3 Articles (Large Cards) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {topThree.map((item) => (
            <Link to={`/news/${item.slug}`} key={item.id}>
              <Card className="hover:shadow-xl transition-shadow duration-300 bg-white rounded-md overflow-hidden flex flex-col h-full">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                )}
                <CardHeader className="p-4">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-purple-700 line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-col justify-between flex-1">
                  <p className="text-gray-700 text-sm sm:text-base line-clamp-3">
                    {DOMPurify.sanitize(item.content, { ALLOWED_TAGS: [] })}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                      {format(toDate(new Date(item.publishedDate)), 'PPP p', { locale: enIN })}
                    </div>
                    <div className="flex items-center text-purple-600 font-medium text-sm sm:text-base hover:underline cursor-pointer">
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Next 50 Articles (Horizontal Small Cards) */}
      {nextFifty.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-600">More News</h2>
          <div className="flex flex-col gap-4">
            {nextFifty.map((item) => (
              <Link to={`/news/${item.slug}`} key={item.id}>
                <div className="flex items-center bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 p-3 max-w-xl">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-md mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-purple-700 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                      {DOMPurify.sanitize(item.content, { ALLOWED_TAGS: [] })}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1 text-purple-500" />
                      {format(toDate(new Date(item.publishedDate)), 'PPP', { locale: enIN })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 53 && (
        <div className="mt-6 flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 self-center">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}