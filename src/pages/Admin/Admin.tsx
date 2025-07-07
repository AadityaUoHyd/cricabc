import { useEffect, useState, type FC } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Menu, X } from 'lucide-react';

const Admin: FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIsAuthenticated(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Auth verification error:', err.response?.data || err.message);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        setLoading(false);
      });
  }, [navigate]);

  const navItems: Array<{ to: string; label: string }> = [
    { to: 'matches', label: 'Matches' },
    { to: 'news', label: 'News' },
    { to: 'schedules', label: 'Schedules' },
    { to: 'series', label: 'Series' },
    { to: 'teams', label: 'Teams' },
    { to: 'player', label: 'Players' }, // Changed from 'Player' to 'Players'
    { to: 'videos', label: 'Videos' },
    { to: 'rankings', label: 'Rankings' },
    { to: 'quiz', label: 'Quiz' },
  ];

  if (loading) {
    return <div className="text-center p-4 text-sm sm:text-base">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-100">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center sm:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-purple-600"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        <nav
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } justify-center sm:flex sm:space-x-2 mt-2 sm:mt-0 flex-col sm:flex-row space-y-2 sm:space-y-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-md sm:rounded-none shadow-md sm:shadow-none`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={`/admin/${item.to}`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm sm:text-base text-white ${
                  isActive ? 'bg-purple-800 border-2 border-purple-900' : 'bg-purple-600 hover:bg-purple-700'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Admin;