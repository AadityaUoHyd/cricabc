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

  // Helper to get player rank/rating by selected category/format
  const getPlayerRankAndRating = (player: Player) => {
    if (!player.ranking) return { rank: 0, rating: 0 };
    switch (category) {
      case 'batting':
        switch (format) {
          case 'test': return { rank: player.ranking.testBattingRank, rating: player.ranking.testBattingRating };
          case 'odi': return { rank: player.ranking.odiBattingRank, rating: player.ranking.odiBattingRating };
          case 't20': return { rank: player.ranking.t20BattingRank, rating: player.ranking.t20BattingRating };
        }
        break;
      case 'bowling':
        switch (format) {
          case 'test': return { rank: player.ranking.testBowlingRank, rating: player.ranking.testBowlingRating };
          case 'odi': return { rank: player.ranking.odiBowlingRank, rating: player.ranking.odiBowlingRating };
          case 't20': return { rank: player.ranking.t20BowlingRank, rating: player.ranking.t20BowlingRating };
        }
        break;
      case 'all-rounders':
        switch (format) {
          case 'test': return { rank: player.ranking.testAllrounderRank, rating: player.ranking.testAllrounderRating };
          case 'odi': return { rank: player.ranking.odiAllrounderRank, rating: player.ranking.odiAllrounderRating };
          case 't20': return { rank: player.ranking.t20AllrounderRank, rating: player.ranking.t20AllrounderRating };
        }
        break;
      default:
        return { rank: 0, rating: 0 };
    }
    return { rank: 0, rating: 0 };
  };

  // Helper to get team rank/rating by format
  const getTeamRankAndRating = (team: Team) => {
    if (!team.teamRanking) return { rank: 0, rating: 0 };
    switch (format) {
      case 'test': return { rank: team.teamRanking.testRank, rating: team.teamRanking.testRating };
      case 'odi': return { rank: team.teamRanking.odiRank, rating: team.teamRanking.odiRating };
      case 't20': return { rank: team.teamRanking.t20Rank, rating: team.teamRanking.t20Rating };
      default: return { rank: 0, rating: 0 };
    }
  };
  const [format, setFormat] = useState<'test' | 'odi' | 't20'>('test');
  const [items, setItems] = useState<(Player | Team)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);

  // Compute rankedItems for pagination
  const rankedItems = items
    .map((item) => {
      let rank = 0, rating = 0;
      if ('teamRanking' in item) {
        ({ rank, rating } = getTeamRankAndRating(item));
      } else if ('ranking' in item) {
        ({ rank, rating } = getPlayerRankAndRating(item));
      }
      return { item, rank, rating };
    })
    .filter(({ rank }) => rank && rank > 0)
    .sort((a, b) => a.rank - b.rank);

  // Paginate
  const pagedItems = rankedItems.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // Update totalPages in effect
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(rankedItems.length / itemsPerPage));
    setTotalPages(newTotal);
    // Reset to first page if page is out of bounds
    if (page > newTotal - 1) setPage(0);
    // eslint-disable-next-line
  }, [rankedItems.length]);

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
      // We'll handle totalPages after sorting and paginating on frontend

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

      {/* Category Tabs - Hide Batting/Bowling/Allrounder if Teams selected */}
      {category === 'teams' ? null : (
        <Tabs value={category} onValueChange={(val) => setCategory(val as any)} className="mb-6 items-center">
          <TabsList className="grid grid-cols-3 gap-4 bg-white p-2 rounded-lg shadow-sm">
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
          </TabsList>
        </Tabs>
      )}
      {/* Teams tab button */}
      <div className="mb-6 flex justify-center">
        <Button
          variant={category === 'teams' ? 'default' : 'outline'}
          className="mx-2"
          onClick={() => setCategory('teams')}
        >
          Team Rankings
        </Button>
      </div>

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
        {pagedItems.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 py-8">No rankings found.</div>
        )}
        {pagedItems.map(({ item, rank, rating }, index) => (
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
                {'role' in item && category !== 'teams' && (
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
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
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
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
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
