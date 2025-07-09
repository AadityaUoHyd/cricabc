import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { type Match } from '../types/Match';
import MatchCard from '../components/MatchCard';
import { initPusher } from '../lib/pusher';

// Import images from src/assets
import HeroBanner from '../assets/hero-banner.jpg';
import LiveScoreIcon from '../assets/live-score.png';
import PlayerStatsIcon from '../assets/player-stats.png';
import RankingsIcon from '../assets/rankings.png';
import QuizIcon from '../assets/quiz.png';
import NewsIcon from '../assets/news.png';
import AboutCricket from '../assets/about-cricket.png';

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
      try {
        // Defensive: check data shape
        if (!data || typeof data.matchId === 'undefined') {
          console.error('Pusher match-update received malformed data:', data);
          return;
        }
        setMatches(prev => {
          if (!Array.isArray(prev)) {
            console.error('Previous matches state is not an array:', prev);
            return prev || [];
          }
          const updated = prev.filter(m => m && m.matchId !== data.matchId);
          return [...updated, data];
        });
      } catch (err) {
        console.error('Error handling Pusher match-update event:', err, data);
      }
    });

    return () => {
      pusher.unsubscribe('match-channel');
    };
  }, []);

  const matchSliderSettings = {
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

  const testimonialSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: 'linear',
    arrows: false,
    pauseOnHover: true,
    responsive: [
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
    <div className="container mx-auto p-4 space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden shadow-lg mb-12">
        <img src={HeroBanner} alt="CricABC Hero Cricket Stadium" className="w-full h-[340px] sm:h-[440px] object-cover object-center opacity-90" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-600/60 flex flex-col justify-center items-center text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            CricABC - Live Cricket Updates
          </motion.h1>
          <p className="text-lg sm:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Your ultimate cricket companion for live scores, stats, news, quizzes, and more!
          </p>
          <a href="/teams" className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition">Explore CricABC</a>
        </div>
      </section>

      {/* Live Matches Slider */}
      <section className="mb-12">
        <motion.h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Live Matches</motion.h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {matches.length === 0 && !error && <p className="text-center text-gray-600">Loading matches...</p>}
        <Slider {...matchSliderSettings}>
          {matches.map(match => (
            <div key={match.matchId} className="px-2">
              <MatchCard match={match} />
            </div>
          ))}
        </Slider>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {[
          { icon: LiveScoreIcon, title: 'Live Scores', desc: 'Instant ball-by-ball updates for all major cricket events.' },
          { icon: PlayerStatsIcon, title: 'Player Stats', desc: 'Detailed stats for every player, past and present.' },
          { icon: RankingsIcon, title: 'Rankings', desc: 'ICC team and player rankings, updated in real time.' },
          { icon: QuizIcon, title: 'Cricket Quiz', desc: 'Test your cricket knowledge with fun quizzes.' },
          { icon: NewsIcon, title: 'Cricket News', desc: 'Stay updated with the latest cricket news.' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <img src={f.icon} alt={f.title + ' icon'} className="w-20 h-20 mb-4" loading="lazy" />
            <h3 className="text-xl font-semibold text-purple-700 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* About CricABC */}
      <section className="flex flex-col lg:flex-row items-center gap-10 bg-purple-50 rounded-2xl shadow p-8 max-w-6xl mx-auto">
        <img src={AboutCricket} alt="About CricABC section cricket" className="w-full lg:w-2/5 rounded-xl object-cover shadow-md" loading="lazy" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">About CricABC</h2>
          <p className="text-gray-700 mb-4 text-lg">
            CricABC brings you the thrill of cricket right to your fingertips. Track live scores, explore in-depth player and team stats, enjoy interactive quizzes, and never miss a moment with real-time updates and news.
          </p>
          <ul className="list-disc list-inside text-purple-700 space-y-2 mb-4">
            <li>Comprehensive match coverage</li>
            <li>Historical and live player stats</li>
            <li>Cricket news, rankings, and schedules</li>
            <li>Fun, interactive quizzes for fans</li>
          </ul>
          <a href="/about" className="text-purple-700 font-semibold underline hover:text-purple-900">Learn more about CricABC</a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center mb-12 bg-purple-50 rounded-2xl py-8">
        {[
          { icon: LiveScoreIcon, label: 'Matches', value: '1000+' },
          { icon: PlayerStatsIcon, label: 'Players', value: '500+' },
          { icon: NewsIcon, label: 'Articles', value: '2000+' },
          { icon: QuizIcon, label: 'Quizzes', value: 'Unlimited' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-xl transition">
            <img src={stat.icon} alt={stat.label + ' stat icon'} className="w-16 h-16 mb-2" loading="lazy" />
            <div className="text-2xl font-bold text-purple-700">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </section>

      

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto mb-12 bg-white rounded-2xl py-8 shadow-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">What Fans Say</h2>
        <Slider {...testimonialSliderSettings}>
          {[
            { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', name: 'Rahul Sharma', quote: 'CricABC is my go-to app for everything cricket. The stats and live updates are top notch!' },
            { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', name: 'Priya Singh', quote: 'Love the quizzes and news section. Makes following cricket so much fun!' },
            { avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19', name: 'Amit Patel', quote: 'The real-time rankings and player stats are incredibly detailed!' },
            { avatar: 'https://images.unsplash.com/photo-1532170579297-281918c8ae72', name: 'Sneha Gupta', quote: 'CricABC’s interface is so user-friendly, and the quizzes are addictive!' },
            { avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', name: 'Vikram Rao', quote: 'Best app for keeping up with live cricket scores and news!' },
          ].map(t => (
            <div key={t.name} className="px-2">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-xl transition">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-3 border-2 border-purple-300" />
                <div className="font-semibold text-purple-700 mb-1">{t.name}</div>
                <div className="text-gray-600 text-sm italic">"{t.quote}"</div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* News/Blog Teaser */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Latest Cricket News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { image: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1748355873/sq_iffrk5.jpg', title: 'Agarkar & Co. bet on the long-term vision', link: '/news/agarkar-co-bet-on-the-long-term-vision' },
            { image: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1748368931/tpimmqxibk2giqelys0k.webp', title: 'Virat Kohli, The End of a Glorious Test Chapter', link: '/news/virat-kohli-the-end-of-a-glorious-test-chapter' },
            { image: 'https://res.cloudinary.com/dppx4dm9a/image/upload/v1748371079/xqnpg0pbuugr57cp78xz.avif', title: 'You Do the Thinking, I’ll Do the Executing', link: '/news/you-do-the-thinking-ill-do-the-executing---shreyas-iyer-reveals-winning-chemistry-with-ricky-ponting' },
          ].map(news => (
            <a key={news.title} href={news.link} className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col">
              <img src={news.image} alt={news.title} className="w-full h-40 object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="font-semibold text-purple-700 mb-2">{news.title}</div>
                <span className="text-purple-500 text-xs">Read more</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}