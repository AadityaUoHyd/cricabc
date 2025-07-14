import { type FC, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

interface NavItem {
  name: string;
  path: string;
}

const Header: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const { user } = useUser();

  const navItems: NavItem[] = [
    { name: 'Live Scores', path: '/' },
    { name: 'Cricket Quiz', path: '/quiz' },
    { name: 'CricAbcSocial', path: 'https://cric-abc-social.onrender.com/' },
  ];

  const fixturesItems: NavItem[] = [
    { name: 'Schedule', path: '/schedules' },
    { name: 'Series', path: '/series' },
    { name: 'Archives', path: '/archives' },
  ];

  const leaguesMenItems: NavItem[] = [
    { name: 'IPL', path: '/ipl' },
    { name: 'BBL', path: '#' },
  ];

  const leaguesWomenItems: NavItem[] = [
    { name: 'WPL', path: '/wpl' },
    { name: 'WBBL', path: '#' },
  ];

  const overviewItems: NavItem[] = [
    { name: 'Teams', path: '/teams' },
    { name: 'Rankings', path: '/rankings' },
    { name: 'Venues', path: '/venues' },
  ];

  const insightsItems: NavItem[] = [
    { name: 'News', path: '/news' },
    { name: 'Videos', path: '/videos' },
    { name: 'Photos', path: '#' },
  ];

  const iccMenItems: NavItem[] = [
    { name: 'ODI World Cup', path: '#' },
    { name: 'T20 World Cup', path: '#' },
    { name: 'World Test Championships', path: '#' },
    { name: 'Champions Trophy', path: '#' },
  ];

  const iccWomenItems: NavItem[] = [
    { name: 'ODI World Cup', path: '#' },
    { name: 'T20 World Cup', path: '#' },
  ];

  const domesticMenItems: NavItem[] = [
    { name: 'Ranji Trophy', path: '#' },
    { name: 'Vijay Hazare Trophy', path: '#' },
    { name: 'Syed Mushtaq Ali Trophy', path: '#' },
  ];

  const domesticWomenItems: NavItem[] = [
    { name: "Women's Senior Inter Zonal Multi-Day Trophy", path: '#' },
    { name: "Senior Women's One Day Trophy", path: '#' },
    { name: "Senior Women's T20 Trophy", path: '#' },
  ];

  const moreItems: NavItem[] = [
    { name: 'Know Your Cricket', path: '/know-your-cricket' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Careers', path: '/careers' },
    { name: 'Advertise', path: '/advertise' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Use', path: '/terms' },
    { name: 'CricABC Team', path: '/cricabc-team' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-purple-500 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-2">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <a href="/" className="flex items-center">
            <img
              src="/cl.png"
              alt="CricABC Logo"
              className="w-10 h-10 hover:scale-105 transition-transform duration-200"
              onError={(e) => (e.currentTarget.src = '/fallback-logo.png')}
            />
          </a>
          <h1 className="text-2xl font-bold leading-none">
            <a href="/" className="block mt-1 sm:mt-0">CricABC</a>
          </h1>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Navigation */}
        <nav
          className={cn(
            'md:flex absolute md:static top-16 left-0 w-full md:w-auto bg-purple-900 md:bg-transparent transition-all duration-300 ease-in-out',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <ul className="flex flex-col md:flex-row items-center justify-center md:space-x-4 md:space-y-0 md:p-0 px-4 py-2 md:py-0">
            {navItems.map((item) => (
                <li key={item.name} className="my-1 md:my-0">
                  {item.path.startsWith('http') ? (
                    <a
                      href={item.path}
                      className="block px-2 py-1 text-white hover:text-blue-900 transition-colors text-sm"
                      onClick={() => setIsOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-2 py-1 ${isActive ? 'text-blue-900 font-semibold' : 'text-white'} hover:text-blue-900 transition-colors text-sm`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  )}
                </li>
              ))}
            {/* Fixtures Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    Fixtures
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {fixturesItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      onSelect={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            
            {/* Overview Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    Overview
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {overviewItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      onSelect={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {/* Insights Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    Insights
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {insightsItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      onSelect={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            
            {/* ICC Events Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    ICC Events
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Men</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {iccMenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Women</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {iccWomenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {/* Leagues Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    Leagues
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Men</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {leaguesMenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Women</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {leaguesWomenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {/* Domestic Contest Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    Domestic Contest
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Men</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {domesticMenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Women</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {domesticWomenItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onSelect={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            {/* More Dropdown */}
            <li className="my-1 md:my-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-white hover:text-blue-900 transition-colors"
                  >
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      onSelect={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            {/* Auth Dropdown or Login */}
            <li className="mt-2 md:mt-0 md:ml-2 flex items-center">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <img
                      src="https://res.cloudinary.com/ddgkgaffw/image/upload/v1746756938/avatar-icon_pzqgzx.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition duration-200"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 mt-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="text-red-500 focus:text-red-600"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="rounded-lg font-semibold border border-purple-500 text-purple-600 hover:scale-105 hover:bg-purple-50 transition-transform duration-200"
                  >
                    Admin
                  </Button>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;