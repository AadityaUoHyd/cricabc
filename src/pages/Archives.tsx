import { useEffect, useState } from 'react'
import axios from 'axios'
import MatchCard from '../components/MatchCard'
import { motion } from 'framer-motion'
import Slider from 'react-slick'
import { type Match } from '../types/Match'

export default function Archives() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches/archives`)
      .then(response => {
        setMatches(response.data)
        setError(null)
      })
      .catch(err => {
        setError('Failed to fetch archived matches.')
        console.error(err)
      })
  }, [])

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'linear',
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Match Archives
      </motion.h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {matches.length === 0 && !error && <p className="text-center text-gray-600">Loading archives...</p>}

      {matches.length > 0 && (
        <Slider {...settings}>
          {matches.map(match => (
            <div key={match.matchId} className="px-2">
              <MatchCard match={match} />
            </div>
          ))}
        </Slider>
      )}
    </div>
  )
}
