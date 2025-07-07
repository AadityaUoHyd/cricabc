import { useEffect, useState } from 'react'
import axios from 'axios'
import { initPusher } from '../lib/pusher'
import MatchCard from '../components/MatchCard'
import { motion } from 'framer-motion'
import { type Match } from '../types/Match'

export default function IPL() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch IPL matches
    axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/ipl`)
      .then(response => {
        setMatches(response.data)
        setError(null)
      })
      .catch(err => {
        setError('Failed to fetch IPL matches.')
        console.error(err)
      })

    // Subscribe to Pusher updates
    const pusher = initPusher()
    const channel = pusher.subscribe('match-channel')
    channel.bind('match-update', (data: Match) => {
      if (data.tournament === 'IPL') {
        setMatches(prev => {
          const updated = prev.filter(m => m.matchId !== data.matchId)
          return [...updated, data]
        })
      }
    })

    return () => {
      pusher.unsubscribe('match-channel')
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        IPL 2025
      </motion.h1>
      <div className="flex space-x-4 mb-6 justify-center">
  <button
    onClick={() => window.location.hash = 'matches'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    Matches
  </button>
  <button
    onClick={() => window.location.hash = 'news'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    News
  </button>
  <button
    onClick={() => window.location.hash = 'videos'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    Videos
  </button>
  <button
    onClick={() => window.location.hash = 'points-table'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    Points Table
  </button>
  <button
    onClick={() => window.location.hash = 'stats'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    Stats
  </button>
  <button
    onClick={() => window.location.hash = 'squads'}
    className="text-purple-600 bg-white px-3 py-1 rounded hover:bg-purple-100 focus:bg-purple-500 focus:text-white focus:outline-none transition-colors"
  >
    Squads
  </button>
</div>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {matches.length === 0 && !error && <p className="text-center text-gray-600">Loading IPL matches...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </div>
    </div>
  )
}