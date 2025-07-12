import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import auctionData from '../utils/wpl-auction-data.csv?raw';

interface AuctionPlayer {
  id: string;
  name: string;
  role: string;
  nationality: string;
  basePrice: number;
  purchasedPrice?: number;
  team?: string;
}

interface TeamBudget {
  team: string;
  totalBudget: number;
  remainingBudget: number;
}

function WplAuction() {
  const [soldPlayers, setSoldPlayers] = useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<AuctionPlayer[]>([]);
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>([]);
  const [winners, setWinners] = useState<Array<{year: string, winner: string, runnerUp: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseAuctionData = () => {
      try {
        const parsed = Papa.parse(auctionData, {
          header: false,
          skipEmptyLines: true,
          transform: value => value.trim(),
        });

        if (parsed.errors.length > 0) {
          console.warn('CSV parsing errors encountered:', parsed.errors);
        }

        const data = parsed.data as string[][];
        let currentSection: string | null = null;
        let currentHeaders: string[] = [];
        const sold: AuctionPlayer[] = [];
        const unsold: AuctionPlayer[] = [];
        const budgets: TeamBudget[] = [];
        const winnersData: Array<{year: string, winner: string, runnerUp: string}> = [];
        let unsoldSectionFound = false;

        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          if (row.length === 1) {
            const sectionHeader = row[0].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            if (sectionHeader === 'sold players') {
              currentSection = 'sold';
              currentHeaders = [];
              continue;
            } else if (sectionHeader === 'unsold players') {
              currentSection = 'unsold';
              unsoldSectionFound = true;
              currentHeaders = [];
              continue;
            } else if (sectionHeader === 'team budgets') {
              currentSection = 'budgets';
              currentHeaders = [];
              continue;
            } else if (sectionHeader === 'winners') {
              currentSection = 'winners';
              currentHeaders = [];
              continue;
            } else {
              console.warn(`Unknown section header at row ${i}: "${row[0]}"`);
              continue;
            }
          }

          if (currentSection && currentHeaders.length === 0) {
            if (
              (currentSection === 'sold' && row.some(cell => cell.toLowerCase().includes('id')) && row.some(cell => cell.toLowerCase().includes('name')) && row.some(cell => cell.toLowerCase().includes('purchased'))) ||
              (currentSection === 'unsold' && row.some(cell => cell.toLowerCase().includes('id')) && row.some(cell => cell.toLowerCase().includes('name')) && row.some(cell => cell.toLowerCase().includes('base'))) ||
              (currentSection === 'budgets' && row.some(cell => cell.toLowerCase().includes('team')) && row.some(cell => cell.toLowerCase().includes('total'))) ||
              (currentSection === 'winners' && row.some(cell => cell.toLowerCase().includes('year')) && row.some(cell => cell.toLowerCase().includes('winner')) && row.some(cell => cell.toLowerCase().includes('runnerup')))
            ) {
              currentHeaders = row;
              continue;
            } else {
              console.warn(`Expected headers for ${currentSection} at row ${i}, but got:`, row);
            }
          }

          if (currentSection && currentHeaders.length > 0) {
            if (row.length >= currentHeaders.length) {
              const rowData = Object.fromEntries(currentHeaders.map((header, index) => [header, row[index] || '']));

              if (currentSection === 'winners' && rowData.year && rowData.winner && rowData.runnerUp) {
                winnersData.push({
                  year: rowData.year,
                  winner: rowData.winner,
                  runnerUp: rowData.runnerUp
                });
              } else if (currentSection === 'sold' && rowData.id && rowData.name && rowData.basePrice && rowData.purchasedPrice && rowData.team) {
                const basePrice = parseFloat(rowData.basePrice);
                const purchasedPrice = parseFloat(rowData.purchasedPrice);
                if (!isNaN(basePrice) && !isNaN(purchasedPrice)) {
                  sold.push({
                    id: rowData.id,
                    name: rowData.name,
                    role: rowData.role || 'Unknown',
                    nationality: rowData.nationality || 'Unknown',
                    basePrice,
                    purchasedPrice,
                    team: rowData.team,
                  });
                } else {
                  console.warn(`Skipping sold player row ${i} due to invalid numbers:`, rowData);
                }
              } else if (currentSection === 'unsold' && rowData.id && rowData.name && rowData.basePrice) {
                const basePrice = parseFloat(rowData.basePrice);
                if (!isNaN(basePrice)) {
                  unsold.push({
                    id: rowData.id,
                    name: rowData.name,
                    role: rowData.role || 'Unknown',
                    nationality: rowData.nationality || 'Unknown',
                    basePrice,
                  });
                } else {
                  console.warn(`Skipping unsold player row ${i} due to invalid basePrice:`, rowData);
                }
              } else if (currentSection === 'budgets' && rowData.team && rowData.totalBudget && rowData.remainingBudget) {
                const totalBudget = parseFloat(rowData.totalBudget);
                const remainingBudget = parseFloat(rowData.remainingBudget);
                if (!isNaN(totalBudget) && !isNaN(remainingBudget)) {
                  budgets.push({
                    team: rowData.team,
                    totalBudget,
                    remainingBudget,
                  });
                } else {
                  console.warn(`Skipping budgets row ${i} due to invalid numbers:`, rowData);
                }
              } else {
                console.warn(`Skipping invalid row in ${currentSection} section at row ${i}:`, rowData);
              }
            } else {
              console.warn(`Skipping row ${i} due to column mismatch in ${currentSection} section (expected ${currentHeaders.length} columns, got ${row.length}):`, row);
            }
          } else if (row.length > 0) {
            console.warn(`Skipping row ${i} (no section or headers defined):`, row);
          }
        }

        if (!unsoldSectionFound) {
          console.warn('Unsold Players section not found in CSV.');
          setError('Unsold Players section not found in CSV. Ensure the section header is "# Unsold Players".');
        }

        setSoldPlayers(sold);
        setUnsoldPlayers(unsold);
        setTeamBudgets(budgets);
        setWinners(winnersData);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error parsing auction data:', err);
        setError('Failed to load WPL 2025 auction data. Please verify the CSV file has correct sections (# Sold Players, # Unsold Players, # Team Budgets) and column headers.');
        setIsLoading(false);
      }
    };

    parseAuctionData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
                src="src/assets/wpl-auction-2025.png"
                alt="WPL 2025 Auction"
                className="w-full h-full object-cover"
              />
            </div>
            <a
              href="https://www.youtube.com/watch?v=hDyUQf5LwDw"
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

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2" /> WPL Winners
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runner-Up</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {winners.map((winner, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{winner.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{winner.winner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{winner.runnerUp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
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
              {soldPlayers.length === 0 ? (
                <p className="text-gray-500">No sold players data available.</p>
              ) : (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.purchasedPrice || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team || 'N/A'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

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
              {unsoldPlayers.length === 0 ? (
                <p className="text-gray-500">No unsold players data available.</p>
              ) : (
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
              )}
            </motion.div>

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
              {teamBudgets.length === 0 ? (
                <p className="text-gray-500">No team budgets data available.</p>
              ) : (
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
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WplAuction;