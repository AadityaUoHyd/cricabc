import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy } from 'lucide-react';
import { type Player} from '../types/Player';
import { type Team } from '../types/Team';

export default function Rankings() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [category, setCategory] = useState<'batting' | 'bowling' | 'all-rounders' | 'teams'>('batting');
  const [format, setFormat] = useState<'test' | 'odi' | 't20'>('test');
  const [items, setItems] = useState<(Player | Team)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRankings();
  }, [gender, category, page]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const url = category === 'teams'
        ? `${import.meta.env.VITE_API_URL}/rankings/teams`
        : `${import.meta.env.VITE_API_URL}/rankings/players`;
      const params = category === 'teams'
        ? { gender, page, size: 10 }
        : { gender, category, page, size: 10 };
      const response = await axios.get(url, { params });
      setItems(response.data as (Player | Team)[]);
      setTotalPages(Number(response.headers['x-total-pages']) || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rankings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRank = (item: Player | Team) => {
    let ranking: any;
    if ('teamRanking' in item) {
      ranking = item.teamRanking;
    } else if ('ranking' in item) {
      ranking = item.ranking;
    } else {
      ranking = null;
    }
    if (!ranking) return { rank: 0, rating: 0 };
    switch (format) {
      case 'test': return { rank: ranking.testRank, rating: ranking.testRating };
      case 'odi': return { rank: ranking.odiRank, rating: ranking.odiRating };
      case 't20': return { rank: ranking.t20Rank, rating: ranking.t20Rating };
      default: return { rank: 0, rating: 0 };
    }
  };

  return (
  <div className="bg-gray-50 min-h-screen">
    <div className="container mx-auto px-4 py-6">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-10 text-center text-purple-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ICC Cricket Rankings
      </motion.h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading && <p className="text-purple-600 text-center mb-4">Loading...</p>}

      {/* Gender Tabs */}
      <Tabs value={gender} onValueChange={(val) => setGender(val as 'male' | 'female')} className="mb-6 items-center">
        <TabsList className="grid grid-cols-2 gap-4 bg-white p-2 rounded-lg shadow-sm">
          <TabsTrigger
            value="male"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Men
          </TabsTrigger>
          <TabsTrigger
            value="female"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Women
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={(val) => setCategory(val as any)} className="mb-6 items-center">
        <TabsList className="grid grid-cols-4 gap-4 bg-white p-2 rounded-lg shadow-sm">
          <TabsTrigger
            value="batting"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Batting
          </TabsTrigger>
          <TabsTrigger
            value="bowling"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Bowling
          </TabsTrigger>
          <TabsTrigger
            value="all-rounders"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            All-rounders
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Teams
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Format Tabs */}
      <Tabs value={format} onValueChange={(val) => setFormat(val as any)} className="mb-8 items-center">
        <TabsList className="grid grid-cols-3 gap-4 bg-white p-2 rounded-lg shadow-sm">
          <TabsTrigger
            value="test"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Test
          </TabsTrigger>
          <TabsTrigger
            value="odi"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            ODI
          </TabsTrigger>
          <TabsTrigger
            value="t20"
            className="py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            T20I
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Ranking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const { rank, rating } = getRank(item);
          if (rank === 0) return null;

          return (
            <motion.div
              key={'id' in item ? item.id : index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg bg-white">
                <CardContent className="flex items-center gap-4 p-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-purple-600">
                      #{rank} {'name' in item ? item.name : ''}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {'country' in item ? item.country : ''} | Rating: {rating}
                    </p>
                  </div>
                  {'role' in item && (
                    <Button
                      asChild
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-4 py-2 rounded"
                    >
                      <a href={`/player/${item.id}`}>View Profile</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-sm px-4 py-2 hover:bg-purple-50"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-sm px-4 py-2 hover:bg-purple-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  </div>
);


}
