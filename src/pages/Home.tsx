import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { type Match } from '../types/Match';
import MatchCard from '../components/MatchCard';
import { initPusher } from '../lib/pusher';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch matches
    axios.get<Match[]>(`${import.meta.env.VITE_API_URL}/matches`)
      .then(response => {
        setMatches(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to fetch matches. Please try again later.');
        console.error(err);
      });

    // Subscribe to Pusher updates
    const pusher = initPusher();
    const channel = pusher.subscribe('match-channel');
    channel.bind('match-update', (data: Match) => {
      setMatches(prev => {
        const updated = prev.filter(m => m.matchId !== data.matchId);
        return [...updated, data];
      });
    });

    return () => {
      pusher.unsubscribe('match-channel');
    };
  }, []);

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
  };

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        CricLive - Live Cricket Updates
      </motion.h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {matches.length === 0 && !error && <p className="text-center text-gray-600">Loading matches...</p>}
      <Slider {...settings} >
        {matches.map(match => (
          <div key={match.matchId} className="px-2">
            <MatchCard match={match} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
