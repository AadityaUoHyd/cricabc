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

function WplAuction() {
  const [soldPlayers, setSoldPlayers] = useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<AuctionPlayer[]>([]);
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        // Simulated API response (replace with actual API calls when available)
        // Example: const response = await axios.get(`${import.meta.env.VITE_API_URL}/auction/wpl/2025`);
        const mockAuctionData = {
          soldPlayers: [
            { id: '1', name: 'Simran Shaikh', role: 'Allrounder', nationality: 'India', basePrice: 10, purchasedPrice: 190, team: 'Gujarat Giants' },
            { id: '2', name: 'Deandra Dottin', role: 'Allrounder', nationality: 'West Indies', basePrice: 50, purchasedPrice: 170, team: 'Gujarat Giants' },
            { id: '3', name: 'G Kamalini', role: 'Wicketkeeper-Batter', nationality: 'India', basePrice: 10, purchasedPrice: 160, team: 'Mumbai Indians' },
            { id: '4', name: 'Prema Rawat', role: 'Allrounder', nationality: 'India', basePrice: 10, purchasedPrice: 120, team: 'Royal Challengers Bengaluru' },
            { id: '5', name: 'N Charani', role: 'Allrounder', nationality: 'India', basePrice: 10, purchasedPrice: 55, team: 'Delhi Capitals' },
            { id: '6', name: 'Nandini Kashyap', role: 'Wicketkeeper-Batter', nationality: 'India', basePrice: 10, purchasedPrice: 30, team: 'Delhi Capitals' },
            { id: '7', name: 'Sarah Bryce', role: 'Wicketkeeper-Batter', nationality: 'Scotland', basePrice: 10, purchasedPrice: 10, team: 'Delhi Capitals' },
            { id: '8', name: 'Arushi Goel', role: 'Batter', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'Delhi Capitals' },
            { id: '9', name: 'Nadine de Klerk', role: 'Allrounder', nationality: 'South Africa', basePrice: 30, purchasedPrice: 30, team: 'Mumbai Indians' },
            { id: '10', name: 'Sanskriti Gupta', role: 'Batter', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'Mumbai Indians' },
            { id: '11', name: 'Raghvi Bist', role: 'Batter', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'Royal Challengers Bengaluru' },
            { id: '12', name: 'Charlie Dean', role: 'Allrounder', nationality: 'England', basePrice: 30, purchasedPrice: 30, team: 'Royal Challengers Bengaluru' },
            { id: '13', name: 'Prakakshika Naik', role: 'Bowler', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'Gujarat Giants' },
            { id: '14', name: 'Danielle Gibson', role: 'Allrounder', nationality: 'England', basePrice: 30, purchasedPrice: 30, team: 'Gujarat Giants' },
            { id: '15', name: 'Mansi Joshi', role: 'Bowler', nationality: 'India', basePrice: 30, purchasedPrice: 30, team: 'UP Warriorz' },
            { id: '16', name: 'Alana King', role: 'Bowler', nationality: 'Australia', basePrice: 30, purchasedPrice: 30, team: 'UP Warriorz' },
            { id: '17', name: 'Kranti Goud', role: 'Allrounder', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'UP Warriorz' },
            { id: '18', name: 'S Yashasri', role: 'Bowler', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'UP Warriorz' },
            { id: '19', name: 'Archana Shinde', role: 'Bowler', nationality: 'India', basePrice: 10, purchasedPrice: 10, team: 'UP Warriorz' },
          ],
          unsoldPlayers: [
            { id: '20', name: 'Heather Knight', role: 'Batter', nationality: 'England', basePrice: 50, purchasedPrice: undefined, team: undefined },
            { id: '21', name: 'Poonam Yadav', role: 'Bowler', nationality: 'India', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '22', name: 'Sneh Rana', role: 'Allrounder', nationality: 'India', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '23', name: 'Sarah Glenn', role: 'Bowler', nationality: 'England', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '24', name: 'Lauren Bell', role: 'Bowler', nationality: 'England', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '25', name: 'Anshu Nagar', role: 'Bowler', nationality: 'India', basePrice: 10, purchasedPrice: undefined, team: undefined },
            { id: '26', name: 'Darcie Brown', role: 'Bowler', nationality: 'Australia', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '27', name: 'Chinelle Henry', role: 'Allrounder', nationality: 'West Indies', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '28', name: 'Maia Bouchier', role: 'Batter', nationality: 'England', basePrice: 30, purchasedPrice: undefined, team: undefined },
            { id: '29', name: 'Heather Graham', role: 'Allrounder', nationality: 'Australia', basePrice: 30, purchasedPrice: undefined, team: undefined },
          ],
          teamBudgets: [
            { team: 'Royal Challengers Bengaluru', totalBudget: 15, remainingBudget: 1.95 },
            { team: 'Mumbai Indians', totalBudget: 15, remainingBudget: 0.65 },
            { team: 'Delhi Capitals', totalBudget: 15, remainingBudget: 1.75 },
            { team: 'Gujarat Giants', totalBudget: 15, remainingBudget: 0.80 },
            { team: 'UP Warriorz', totalBudget: 15, remainingBudget: 3.70 },
          ],
        };

        setSoldPlayers(mockAuctionData.soldPlayers);
        setUnsoldPlayers(mockAuctionData.unsoldPlayers);
        setTeamBudgets(mockAuctionData.teamBudgets);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching WPL auction data:', err);
        setError('Failed to load WPL 2025 auction data.');
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-500">WPL 2025 Auction</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-6">
              Experience the thrill of the WPL 2025 mini-auction, where teams strategized to build their squads for the upcoming season.
            </p>
            <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
              <img
                src="src/assets/wpl-auction-2025.png" // Placeholder for 16:9 hero image
                alt="WPL 2025 Auction"
                className="w-full h-full object-cover"
              />
            </div>
            <a
              href="https://www.youtube.com/watch?v=hDyUQf5LwDw" // Placeholder YouTube link
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

export default WplAuction;