import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import auctionData from '../utils/ipl-auction-data.csv?raw';

// Import images
import auc1 from '../assets/auc1.png';
import auc2 from '../assets/auc2.png';
import auc3 from '../assets/auc3.png';
import auc4 from '../assets/auc4.png';
import auc5 from '../assets/auc5.png';
import auc6 from '../assets/auc6.png';

const auctionImages = [auc1, auc2, auc3, auc4, auc5, auc6];

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
  const [currentImage, setCurrentImage] = useState(1);

  useEffect(() => {
    // Auto-advance the carousel every 5 seconds
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev % 6) + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const [soldPlayers, setSoldPlayers] = useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<AuctionPlayer[]>([]);
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseAuctionData = () => {
      try {
        const parsed = Papa.parse(auctionData, {
          skipEmptyLines: true,
          transform: value => typeof value === 'string' ? value.trim() : value,
        });

        if (parsed.errors.length > 0) {
          console.warn('CSV parsing errors encountered:', parsed.errors);
        }

        const data = parsed.data as string[][];
        let currentSection: 'sold' | 'unsold' | 'budgets' | null = null;
        let currentHeaders: string[] = [];
        const sold: AuctionPlayer[] = [];
        const unsold: AuctionPlayer[] = [];
        const budgets: TeamBudget[] = [];
        let unsoldSectionFound = false;

        for (let i = 0; i < data.length; i++) {
          const row = data[i].filter(cell => cell !== '');
          if (row.length === 0) continue;

          // Check for section headers
          const firstCell = String(row[0]).toLowerCase().trim();
          
          if (firstCell.startsWith('#')) {
            const sectionName = firstCell.replace(/^#\s*/, '').toLowerCase();
            
            if (sectionName.includes('sold') && !sectionName.includes('unsold')) {
              currentSection = 'sold';
              currentHeaders = [];
            } else if (sectionName.includes('unsold')) {
              currentSection = 'unsold';
              unsoldSectionFound = true;
              currentHeaders = [];
            } else if (sectionName.includes('budget')) {
              currentSection = 'budgets';
              currentHeaders = [];
            } else if (sectionName.includes('winners')) {
              // Skip the winners section completely as it's not being used
              currentSection = null;
              continue;
            } else {
              console.warn(`Unknown section header at row ${i + 1}: "${row[0]}"`);
              currentSection = null;
            }
            continue;
          }

          // Process data rows based on current section
          if (!currentSection) continue;

          // Handle header row
          if (currentHeaders.length === 0) {
            // Validate headers based on section
            const isSoldHeader = currentSection === 'sold' && 
              row.some(cell => cell.toLowerCase().includes('purchased')) &&
              row.some(cell => cell.toLowerCase().includes('team'));
              
            const isUnsoldHeader = currentSection === 'unsold' && 
              row.some(cell => cell.toLowerCase().includes('baseprice')) &&
              !row.some(cell => cell.toLowerCase().includes('purchased'));
              
            const isBudgetHeader = currentSection === 'budgets' && 
              row.some(cell => cell.toLowerCase().includes('total')) &&
              row.some(cell => cell.toLowerCase().includes('remaining'));

            if (isSoldHeader || isUnsoldHeader || isBudgetHeader) {
              currentHeaders = row.map(h => h.trim());
            } else {
              console.warn(`Skipping invalid headers for ${currentSection} at row ${i + 1}:`, row);
              currentSection = null;
            }
            continue;
          }

          // Process data rows
          if (currentHeaders.length > 0) {
            const rowData: Record<string, string> = {};
            
            // Create row data object with headers as keys
            for (let j = 0; j < Math.min(row.length, currentHeaders.length); j++) {
              rowData[currentHeaders[j].toLowerCase()] = String(row[j] || '').trim();
            }

            try {
              // Process based on section
              if (currentSection === 'sold' && rowData.id && rowData.name) {
                const basePrice = parseFloat(rowData.baseprice || '0');
                const purchasedPrice = parseFloat(rowData.purchasedprice || '0');
                
                if (!isNaN(basePrice) && !isNaN(purchasedPrice) && rowData.team) {
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
                  console.warn(`Skipping sold player row ${i + 1} due to missing or invalid data:`, rowData);
                }
              } 
              else if (currentSection === 'unsold' && rowData.id && rowData.name) {
                const basePrice = parseFloat(rowData.baseprice || '0');
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
                  console.warn(`Skipping unsold player row ${i + 1} due to invalid basePrice:`, rowData);
                }
              }
              else if (currentSection === 'budgets' && rowData.team) {
                const totalBudget = parseFloat(rowData.totalbudget || '0');
                const remainingBudget = parseFloat(rowData.remainingbudget || '0');
                
                if (!isNaN(totalBudget) && !isNaN(remainingBudget)) {
                  budgets.push({
                    team: rowData.team,
                    totalBudget,
                    remainingBudget,
                  });
                } else {
                  console.warn(`Skipping budget row ${i + 1} due to invalid numbers:`, rowData);
                }
              }
            } catch (err) {
              console.error(`Error processing row ${i + 1}:`, row, err);
            }
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
              <div className="relative w-full h-full">
                {auctionImages.map((img, index) => (
                  <img
                    key={index + 1}
                    src={img}
                    alt={`IPL 2025 Auction ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{
                      opacity: currentImage === index + 1 ? 1 : 0,
                      zIndex: currentImage === index + 1 ? 1 : 0
                    }}
                  />
                ))}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                  {auctionImages.map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentImage(index + 1)}
                      className={`w-3 h-3 rounded-full ${currentImage === index + 1 ? 'bg-white' : 'bg-white/50'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
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