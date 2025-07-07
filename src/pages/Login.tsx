import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext'; 
import Logo from '../assets/cl.png';
import LoginImg from '../assets/criclive-login.png';
import { motion } from 'framer-motion';

interface LoginResponse {
  token: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);

      const payload = JSON.parse(atob(response.data.token.split('.')[1]));
      const userEmail = payload.sub;

      setUser({ email: userEmail });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${LoginImg})` }}
    >
      <div className="backdrop-blur-sm bg-white/80 rounded-lg p-8 shadow-xl w-full max-w-md mx-4">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-6 text-center text-purple-600 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src={Logo} alt="CricLive Logo" className="w-10 h-10" />
          Admin Login
        </motion.h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-800 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
