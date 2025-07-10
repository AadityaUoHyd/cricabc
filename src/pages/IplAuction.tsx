import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, ExternalLink } from 'lucide-react';

interface AuctionPlayer {
  id: string;
  name: string;
  role: string;
  nationality: string;
  basePrice: number; // in INR Lakhs
  purchasedPrice?: number; // in INR Lakhs
  team?: string; // Team name or undefined if unsold
}

interface TeamBudget {
  team: string;
  totalBudget: number; // in INR Crores
  remainingBudget: number; // in INR Crores
}

function IplAuction() {
  const [soldPlayers, setSoldPlayers] = useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<AuctionPlayer[]>([]);
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        // Simulated API response (replace with actual API calls when available)
        // Example: const response = await axios.get(`${import.meta.env.VITE_API_URL}/auction/ipl/2025`);
        const mockAuctionData = {
          soldPlayers: [
            { id: '1', name: 'Rishabh Pant', role: 'Wicketkeeper-Batsman', nationality: 'India', basePrice: 200, purchasedPrice: 2700, team: 'Lucknow Super Giants' },
            { id: '2', name: 'Shreyas Iyer', role: 'Batsman', nationality: 'India', basePrice: 200, purchasedPrice: 2675, team: 'Punjab Kings' },
            { id: '3', name: 'Jos Buttler', role: 'Wicketkeeper-Batsman', nationality: 'England', basePrice: 200, purchasedPrice: 1525, team: 'Gujarat Titans' },
            { id: '4', name: 'Jofra Archer', role: 'Bowler', nationality: 'England', basePrice: 200, purchasedPrice: 1250, team: 'Mumbai Indians' },
            { id: '5', name: 'KL Rahul', role: 'Wicketkeeper-Batsman', nationality: 'India', basePrice: 200, purchasedPrice: 1400, team: 'Delhi Capitals' },
            { id: '6', name: 'Yuzvendra Chahal', role: 'Bowler', nationality: 'India', basePrice: 200, purchasedPrice: 1800, team: 'Royal Challengers Bengaluru' },
            { id: '7', name: 'David Warner', role: 'Batsman', nationality: 'Australia', basePrice: 200, purchasedPrice: 625, team: 'Sunrisers Hyderabad' },
            { id: '8', name: 'Kagiso Rabada', role: 'Bowler', nationality: 'South Africa', basePrice: 200, purchasedPrice: 975, team: 'Kolkata Knight Riders' },
            { id: '9', name: 'Faf du Plessis', role: 'Batsman', nationality: 'South Africa', basePrice: 200, purchasedPrice: 700, team: 'Chennai Super Kings' },
            { id: '10', name: 'Trent Boult', role: 'Bowler', nationality: 'New Zealand', basePrice: 200, purchasedPrice: 1250, team: 'Rajasthan Royals' },
          ],
          unsoldPlayers: [
            { id: '11', name: 'Ben Stokes', role: 'Allrounder', nationality: 'England', basePrice: 200, purchasedPrice: undefined, team: undefined },
            { id: '12', name: 'Joe Root', role: 'Batsman', nationality: 'England', basePrice: 200, purchasedPrice: undefined, team: undefined },
            { id: '13', name: 'Jason Holder', role: 'Allrounder', nationality: 'West Indies', basePrice: 150, purchasedPrice: undefined, team: undefined },
            { id: '14', name: 'Shakib Al Hasan', role: 'Allrounder', nationality: 'Bangladesh', basePrice: 150, purchasedPrice: undefined, team: undefined },
          ],
          teamBudgets: [
            { team: 'Chennai Super Kings', totalBudget: 120, remainingBudget: 2.87 },
            { team: 'Delhi Capitals', totalBudget: 120, remainingBudget: 9.9 },
            { team: 'Gujarat Titans', totalBudget: 120, remainingBudget: 4.1 },
            { team: 'Kolkata Knight Riders', totalBudget: 120, remainingBudget: 1.35 },
            { team: 'Lucknow Super Giants', totalBudget: 120, remainingBudget: 0.95 },
            { team: 'Mumbai Indians', totalBudget: 120, remainingBudget: 1.65 },
            { team: 'Punjab Kings', totalBudget: 120, remainingBudget: 4.15 },
            { team: 'Rajasthan Royals', totalBudget: 120, remainingBudget: 4.1 },
            { team: 'Royal Challengers Bengaluru', totalBudget: 120, remainingBudget: 2.85 },
            { team: 'Sunrisers Hyderabad', totalBudget: 120, remainingBudget: 5.1 },
          ],
        };

        setSoldPlayers(mockAuctionData.soldPlayers);
        setUnsoldPlayers(mockAuctionData.unsoldPlayers);
        setTeamBudgets(mockAuctionData.teamBudgets);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching auction data:', err);
        setError('Failed to load IPL 2025 auction data.');
        setIsLoading(false);
      }
    };

    fetchAuctionData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-500">IPL 2025 Auction</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-6">
              Relive the excitement of the IPL 2025 mega auction, where top players were signed and new team strategies emerged.
            </p>
            <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
              <img
                src="src/assets/ipl-auction-2025.png" // Placeholder for 16:9 hero image
                alt="IPL 2025 Auction"
                className="w-full h-full object-cover"
              />
            </div>
            <a
              href="https://www.youtube.com/watch?v=YpbjdI1HRg4" // Replace with actual YouTube link
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Watch Auction Highlights on YouTube
            </a>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Sold Players Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-purple-600" />
                Sold Players
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nationality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Base Price (₹ Lakhs)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Purchased Price (₹ Lakhs)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Team</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {soldPlayers.map((player, index) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.nationality}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.basePrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.purchasedPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Unsold Players Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-600" />
                Unsold Players
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nationality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Base Price (₹ Lakhs)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unsoldPlayers.map((player, index) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.nationality}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.basePrice}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Team Budgets Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-purple-600" />
                Team Budgets
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total Budget (₹ Crores)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Remaining Budget (₹ Crores)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamBudgets.map((budget, index) => (
                      <motion.tr
                        key={budget.team}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.team}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.totalBudget}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.remainingBudget}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IplAuction;