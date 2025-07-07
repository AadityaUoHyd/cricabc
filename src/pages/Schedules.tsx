import { useEffect, useState } from 'react'
import axios from 'axios'
import MatchCard from '../components/MatchCard'
import { motion } from 'framer-motion'
import { type Match } from '../types/Match'

export default function Schedules() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch schedules
    axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/schedules`)
      .then(response => {
        setMatches(response.data)
        setError(null)
      })
      .catch(err => {
        setError('Failed to fetch schedules.')
        console.error(err)
      })
  }, [])

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Match Schedules
      </motion.h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {matches.length === 0 && !error && <p className="text-center text-gray-600">Loading schedules...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </div>
    </div>
  )
}