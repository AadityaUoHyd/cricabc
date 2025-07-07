import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { initPusher } from '../lib/pusher'
import { motion } from 'framer-motion'
import { GiCricketBat } from "react-icons/gi";

interface Match {
  matchId: string
  title: string
  team1: string
  team2: string
  score: string
  status: string
  commentary: string
  date: string
  matchType: string
  tournament: string
  fantasyLink: string
  pointsTableLink: string
  scheduleLink: string
}

export default function LiveScore() {
  const { matchId } = useParams()
  const [match, setMatch] = useState<Match | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch match details
    axios.get<Match>(`${import.meta.env.VITE_API_URL}/matches/${matchId}`)
      .then(response => {
        setMatch(response.data)
        setError(null)
      })
      .catch(err => {
        setError('Failed to fetch match details.')
        console.error(err)
      })

    // Subscribe to Pusher updates
    const pusher = initPusher()
    const channel = pusher.subscribe('match-channel')
    channel.bind('match-update', (data: Match) => {
      if (data.matchId === matchId) {
        setMatch(data)
      }
    })

    return () => {
      pusher.unsubscribe('match-channel')
    }
  }, [matchId])

  if (error) return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>
  if (!match) return <div className="container mx-auto p-4 text-center">Loading...</div>

return (
  <div className="container mx-auto p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-md flex flex-col"
      style={{ minHeight: '450px' }} // slightly increased for better spacing
    >
      {/* Header */}
      <div className="flex items-center mb-4">
        <GiCricketBat className="w-8 h-8 mr-2 text-purple-600" />
        <h1 className="text-2xl font-bold">{match.title}</h1>
      </div>

      {/* Match info */}
      <p className="text-sm text-gray-600">{match.matchType} • {match.tournament}</p>
      <p className="text-lg font-medium mt-2">{match.team1} vs {match.team2}</p>
      <p className="text-2xl font-semibold text-purple-600">{match.score}</p>
      <p className="text-sm text-gray-500">{match.status}</p>
      <p className="text-sm text-gray-500">{match.date}</p>

      {/* Links */}
      <div className="mt-4 flex space-x-4 text-sm">
        <Link to={match.fantasyLink} className="text-purple-600 hover:underline">Fantasy</Link>
        <Link to={match.pointsTableLink} className="text-purple-600 hover:underline">Points Table</Link>
        <Link to={match.scheduleLink} className="text-purple-600 hover:underline">Schedule</Link>
      </div>

      {/* Commentary - this section grows and pushes footer down */}
      <div className="mt-6 flex-grow overflow-auto">
        <h2 className="text-lg font-semibold">Live Commentary</h2>
        <p className="text-gray-700 mt-2">{match.commentary}</p>
      </div>
    </motion.div>
  </div>
)

}