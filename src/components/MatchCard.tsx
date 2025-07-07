import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GiCricketBat } from 'react-icons/gi';
import { type Match } from '../types/Match';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const parsedDate = match.dateTimeGMT ? new Date(match.dateTimeGMT + 'Z') : null;

  const handleCardClick = () => {
    navigate(`/live/${match.matchId}`);
  };

  return (
    <motion.div
      className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow border-l-4 border-purple-600 flex flex-col cursor-pointer"
      whileHover={{ scale: 1.02 }}
      style={{ minHeight: 220 }}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <GiCricketBat className="w-6 h-6 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold">{match.title}</h3>
        </div>
        <span className={`text-sm ${match.matchStarted && !match.matchEnded ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
          {match.status}
        </span>
      </div>

      <p className="text-sm text-gray-600">{match.matchType.toUpperCase()} • {match.tournament}</p>
      <p className="text-sm text-gray-600">Venue: {match.venue}</p>

      <div className="mt-2 flex-grow">
        <p className="text-gray-700 font-medium">{match.team1} vs {match.team2}</p>
        <p className="text-xs text-gray-500">
          {parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString() : 'Date unavailable'}
        </p>
      </div>

      <div className="mt-2 flex space-x-4 text-sm" onClick={(e) => e.stopPropagation()}>
        {match.fantasyEnabled && (
          <Link to={match.fantasyLink} className="text-purple-600 hover:underline">Fantasy</Link>
        )}
        <Link to={match.pointsTableLink} className="text-purple-600 hover:underline">Points Table</Link>
        <Link to={match.scheduleLink} className="text-purple-600 hover:underline">Schedule</Link>
      </div>
    </motion.div>
  );
}