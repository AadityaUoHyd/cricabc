import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import auctionData from '../utils/ipl-auction-data.csv?raw';

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

function IplAuction() {
  const [soldPlayers, setSoldPlayers] = useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<AuctionPlayer[]>([]);
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseAuctionData = () => {
      try {
        const parsed = Papa.parse(auctionData, {
          header: false, // Treat CSV as raw rows
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
        let unsoldSectionFound = false;

        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          // Detect section headers
          if (row.length === 1) {
            const sectionHeader = row[0].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            if (sectionHeader === 'sold players' || sectionHeader.includes('soldplayers')) {
              currentSection = 'sold';
              currentHeaders = []; // Reset headers
              continue;
            } else if (sectionHeader === 'unsold players' || sectionHeader.includes('unsoldplayers')) {
              currentSection = 'unsold';
              unsoldSectionFound = true;
              currentHeaders = []; // Reset headers
              continue;
            } else if (sectionHeader === 'team budgets' || sectionHeader.includes('teambudgets')) {
              currentSection = 'budgets';
              currentHeaders = []; // Reset headers
              continue;
            } else {
              console.warn(`Unknown section header at row ${i}: "${row[0]}"`);
              continue;
            }
          }

          // Detect headers for the current section
          if (currentSection && currentHeaders.length === 0) {
            if (
              (currentSection === 'sold' && row.includes('id') && row.includes('name') && row.includes('purchasedPrice') && row.includes('team')) ||
              (currentSection === 'unsold' && row.includes('id') && row.includes('name') && row.includes('basePrice')) ||
              (currentSection === 'budgets' && row.includes('team') && row.includes('totalBudget'))
            ) {
              currentHeaders = row;
              continue;
            } else {
              console.warn(`Expected headers for ${currentSection} at row ${i}, but got:`, row);
            }
          }

          // Process data rows
          if (currentSection && currentHeaders.length > 0) {
            if (row.length >= currentHeaders.length) {
              const rowData = Object.fromEntries(currentHeaders.map((header, index) => [header, row[index] || '']));

              if (currentSection === 'sold' && rowData.id && rowData.name && rowData.basePrice && rowData.purchasedPrice && rowData.team) {
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
                    purchasedPrice: undefined,
                    team: undefined,
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
          } else {
            console.warn(`Skipping row ${i} (no section or headers defined):`, row);
          }
        }

        if (!unsoldSectionFound) {
          console.warn('Unsold Players section not found in CSV.');
          setError('Unsold Players section not found in CSV. Ensure the section header is "# Unsold Players".');
        }

        if (sold.length === 0 && unsold.length === 0 && budgets.length === 0) {
          throw new Error('No valid data found in CSV. Please check section headers and data rows.');
        }

        setSoldPlayers(sold);
        setUnsoldPlayers(unsold);
        setTeamBudgets(budgets);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error parsing auction data:', err);
        setError('Failed to load IPL 2025 auction data. Please verify the CSV file has correct sections (# Sold Players, # Unsold Players, # Team Budgets) and column headers.');
        setIsLoading(false);
      }
    };

    parseAuctionData();
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
                src="src/assets/ipl-auction-2025.png"
                alt="IPL 2025 Auction"
                className="w-full h-full object-cover"
              />
            </div>
            <a
              href="https://www.youtube.com/watch?v=YpbjdI1HRg4"
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
              {soldPlayers.length === 0 && <p className="text-gray-500 text-center">No sold players data available.</p>}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.purchasedPrice ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team ?? 'N/A'}</td>
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
              {unsoldPlayers.length === 0 && <p className="text-gray-500 text-center">No unsold players data available.</p>}
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
              {teamBudgets.length === 0 && <p className="text-gray-500 text-center">No team budgets data available.</p>}
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