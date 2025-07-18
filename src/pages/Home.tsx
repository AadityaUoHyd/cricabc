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

interface Video {
  _id: string;
  title: string;
  url: string;
  description: string;
  createdAt?: string;
}

interface News {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedDate: string;
  imageUrl: string;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch matches
    axios
      .get<Match[]>(`${import.meta.env.VITE_API_URL}/matches`)
      .then(response => {
        setMatches(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to fetch matches. Please try again later.');
        console.error(err);
      });

    // Fetch videos
    axios
      .get<Video[]>(`${import.meta.env.VITE_API_URL}/videos`)
      .then(response => {
        const sortedVideos = response.data
          .sort((a: Video, b: Video) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 4); // Get top 4 latest videos
        setVideos(sortedVideos);
        setVideosLoading(false);
        setVideosError(null);
      })
      .catch(err => {
        setVideosError('Failed to fetch videos. Please try again later.');
        console.error('Error fetching videos:', err);
        setVideosLoading(false);
      });

    // Fetch news
    axios
      .get<News[]>(`${import.meta.env.VITE_API_URL}/news`)
      .then(response => {
        const sortedNews = response.data
          .sort((a: News, b: News) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
          .slice(0, 4); // Get top 4 latest news
        setNews(sortedNews);
        setNewsLoading(false);
        setNewsError(null);
      })
      .catch(err => {
        setNewsError('Failed to fetch news. Please try again later.');
        console.error('Error fetching news:', err);
        setNewsLoading(false);
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
    slidesToShow: 3,
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

  const newsSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
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

  const videoSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
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
    <div className="container mx-auto p-4 space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden shadow-lg mb-12">
        <img
          src={HeroBanner}
          alt="CricABC Hero Cricket Stadium"
          className="w-full h-[340px] sm:h-[440px] object-cover object-center opacity-90"
          loading="lazy"
        />
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
          <a
            href="/teams"
            className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition"
          >
            Explore CricABC
          </a>
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
          <div
            key={f.title}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-xl transition"
          >
            <img src={f.icon} alt={f.title + ' icon'} className="w-20 h-20 mb-4" loading="lazy" />
            <h3 className="text-xl font-semibold text-purple-700 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* About CricABC */}
      <section className="flex flex-col lg:flex-row items-center gap-10 bg-purple-50 rounded-2xl shadow p-8 max-w-6xl mx-auto">
        <img
          src={AboutCricket}
          alt="About CricABC section cricket"
          className="w-full lg:w-2/5 rounded-xl object-cover shadow-md"
          loading="lazy"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">About CricABC</h2>
          <p className="text-gray-700 mb-4 text-lg">
            CricABC brings you the thrill of cricket right to your fingertips. Track live scores, explore in-depth player
            and team stats, enjoy interactive quizzes, and never miss a moment with real-time updates and news.
          </p>
          <ul className="list-disc list-inside text-purple-700 space-y-2 mb-4">
            <li>Comprehensive match coverage</li>
            <li>Historical and live player stats</li>
            <li>Cricket news, rankings, and schedules</li>
            <li>Fun, interactive quizzes for fans</li>
          </ul>
          <a href="/about" className="text-purple-700 font-semibold underline hover:text-purple-900">
            Learn more about CricABC
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-12 bg-purple-50 rounded-2xl py-8 px-6">
        {[
          { icon: LiveScoreIcon, label: 'Matches', value: '1000+' },
          { icon: PlayerStatsIcon, label: 'Players', value: '500+' },
          { icon: NewsIcon, label: 'Articles', value: '2000+' },
          { icon: QuizIcon, label: 'Quizzes', value: 'Unlimited' },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-xl transition"
          >
            <img src={stat.icon} alt={stat.label + ' stat icon'} className="w-24 h-24 mb-2" loading="lazy" />
            <div className="text-2xl font-bold text-purple-700">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* News/Blog Teaser */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Latest Cricket News</h2>
        {newsError && <p className="text-red-500 mb-4 text-center">{newsError}</p>}
        {newsLoading && <p className="text-center text-gray-600">Loading news...</p>}
        {!newsLoading && news.length === 0 && !newsError && (
          <p className="text-center text-gray-600">No news available</p>
        )}
        <Slider {...newsSliderSettings}>
          {news.map(item => (
            <div key={item._id} className="px-2">
              <a
                href={`/news/${item.slug}`}
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col"
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="font-semibold text-purple-700 mb-2">{item.title}</div>
                  <span className="text-purple-500 text-xs">Read more</span>
                </div>
              </a>
            </div>
          ))}
        </Slider>
      </section>

      {/* Video Teaser */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Latest Cricket Videos</h2>
        {videosError && <p className="text-red-500 mb-4 text-center">{videosError}</p>}
        {videosLoading && <p className="text-center text-gray-600">Loading videos...</p>}
        {!videosLoading && videos.length === 0 && !videosError && (
          <p className="text-center text-gray-600">No videos available</p>
        )}
        <Slider {...videoSliderSettings}>
          {videos.map(video => (
            <div key={video._id} className="px-2">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-40 bg-gray-200">
                  <img
                    src={`https://img.youtube.com/vi/${video.url.split('v=')[1]}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="font-semibold text-purple-700 mb-2">{video.title}</div>
                  <span className="text-purple-500 text-xs">Watch on YouTube</span>
                </div>
              </a>
            </div>
          ))}
        </Slider>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto mb-12 bg-white rounded-2xl py-8 shadow-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">What Fans Say</h2>
        <Slider {...testimonialSliderSettings}>
          {[
            {
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
              name: 'Rahul Sharma',
              quote: 'CricABC is my go-to app for everything about cricket. Quite top notch website!',
            },
            {
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
              name: 'Priya Singh',
              quote: 'Love the quizzes and news section. Makes following cricket so much fun!',
            },
            {
              avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19',
              name: 'Amit Patel',
              quote: 'The real-time rankings and player stats are incredibly detailed!',
            },
            {
              avatar: 'https://images.unsplash.com/photo-1532170579297-281918c8ae72',
              name: 'Sneha Gupta',
              quote: 'CricABC’s interface is so user-friendly, and the quizzes are addictive!',
            },
            {
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
              name: 'Vikram Rao',
              quote: 'Best app for keeping up with live cricket scores and news!',
            },
          ].map(t => (
            <div key={t.name} className="px-2">
              <div className="bg-white rounded-xl flex flex-col items-center text-center transition">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-3" />
                <div className="font-semibold text-purple-700 mb-1">{t.name}</div>
                <div className="text-gray-600 text-sm italic">"{t.quote}"</div>
              </div>
            </div>
          ))}
        </Slider>
      </section>
    </div>
  );
}