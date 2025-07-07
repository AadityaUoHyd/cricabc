import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format, toDate } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { FacebookProvider, Comments } from 'react-facebook';
import { Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { type News } from '../types/News';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<News>(`${import.meta.env.VITE_API_URL}/news/${slug}`)
      .then((response) => {
        setNews(response.data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch news article.');
        console.error(err);
      });
  }, [slug]);

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }

  if (!news) {
    return <p className="text-center py-8 text-gray-600">Loading...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-3xl mx-auto shadow-md rounded-lg overflow-hidden">
          {news.imageUrl && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
          )}

          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-700 leading-tight">
              {news.title}
            </CardTitle>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
              <div className="flex items-center mb-2 sm:mb-0">
                <User className="w-4 h-4 mr-2 text-purple-500" />
                <span>{news.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span>{format(toDate(new Date(news.publishedDate)), 'PPP p', { locale: enIN })}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-4">
            <div
              className="prose max-w-none text-gray-800 sm:prose-lg prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
            />

            <div className="mt-10 border-t pt-6">
              <h2 className="text-lg sm:text-xl font-semibold text-purple-700 mb-4">
                Comments
              </h2>
              <FacebookProvider appId={import.meta.env.VITE_API_URL}>
                <Comments href={`https://cricabc.vercel.app/news/${slug}`} width="100%" />
              </FacebookProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
