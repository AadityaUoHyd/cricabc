import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type FC, Suspense, lazy, Component, type ReactNode } from 'react';
import { useRestoreUser } from './hooks/useRestoreUser';
import { PlayerProvider } from './context/PlayerContext';
import { MatchesProvider } from './context/MatchesContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminVenue from './pages/Admin/AdminVenue';
import TeamDetails from './pages/TeamDetails';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const LiveScore = lazy(() => import('./pages/LiveScore'));
const IPL = lazy(() => import('./pages/IPL'));
const Schedules = lazy(() => import('./pages/Schedules'));
const Archive = lazy(() => import('./pages/Archives'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Series = lazy(() => import('./pages/Series'));
const Teams = lazy(() => import('./pages/Teams'));
const Videos = lazy(() => import('./pages/Videos'));
const Rankings = lazy(() => import('./pages/Rankings'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const AdminNews = lazy(() => import('./pages/Admin/AdminNews'));
const AdminRankings = lazy(() => import('./pages/Admin/AdminRankings'));
const AdminPlayer = lazy(() => import('./pages/Admin/AdminPlayer'));
const AdminSchedules = lazy(() => import('./pages/Admin/AdminSchedules'));
const AdminSeries = lazy(() => import('./pages/Admin/AdminSeries'));
const AdminVideos = lazy(() => import('./pages/Admin/AdminVideos'));
const AdminQuiz = lazy(() => import('./pages/Admin/AdminQuiz')); 
const About = lazy(() => import('./pages/More/About')); 
const Contact = lazy(() => import('./pages/More/Contact')); 
const Career = lazy(() => import('./pages/More/Career')); 
const Advertise = lazy(() => import('./pages/More/Advertise')); 
const PrivacyPolicy = lazy(() => import('./pages/More/PrivacyPolicy')); 
const TermsOfUse = lazy(() => import('./pages/More/TermsOfUse')); 
const CricABCTeam = lazy(() => import('./pages/More/CricAbcTeam')); 
const CricABCCricketQuiz = lazy(() => import('./pages/CricAbcCricketQuiz')); 
const AdminMatchesPage = lazy(() => import('./pages/Admin/AdminMatchesPage'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const AdminTeams = lazy(() => import('./pages/Admin/AdminTeams'));
const AdminIPL = lazy(() => import('./pages/Admin/AdminIPL'));
const AdminWPL = lazy(() => import('./pages/Admin/AdminWPL'));
const WPL = lazy(() => import('./pages/WPL'));
const Venues = lazy(() => import('./pages/Venues/Venues'));
const VenueDetail = lazy(() => import('./pages/Venues/VenueDetail'));

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Error Boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h1 className="text-red-600 text-2xl mb-4">Something went wrong.</h1>
          <p className="mb-4">Please try again or return to the homepage.</p>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: FC = () => {
  useRestoreUser();
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <ErrorBoundary>
            <PlayerProvider>
            <MatchesProvider>
              <Suspense fallback={
                <div className="flex justify-center items-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/live/:matchId" element={<LiveScore />} />
                  <Route path="/ipl" element={<IPL />} />
                  <Route path="/wpl" element={<WPL />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/archives" element={<Archive />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:slug" element={<NewsDetail />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/team/:id" element={<TeamDetails />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/venues" element={<Venues />} />
                  <Route path="/venues/:id" element={<VenueDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/player/:id" element={<PlayerProfile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/careers" element={<Career />} />
                  <Route path="/advertise" element={<Advertise />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/cricabc-team" element={<CricABCTeam />} />
                  <Route path="/quiz" element={<CricABCCricketQuiz />} />
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminTeams />} />
                    <Route path="matches" element={<AdminMatchesPage />} />
                    <Route path="news" element={<AdminNews />} />
                    <Route path="rankings" element={<AdminRankings />} />
                    <Route path="player" element={<AdminPlayer />} /> 
                    <Route path="schedules" element={<AdminSchedules />} />
                    <Route path="series" element={<AdminSeries />} />
                    <Route path="ipl" element={<AdminIPL />} />
                    <Route path="wpl" element={<AdminWPL />} />
                    <Route path="venues" element={<AdminVenue />} />
                    <Route path="videos" element={<AdminVideos />} />
                    <Route path="teams" element={<AdminTeams />} />
                    <Route path="quiz" element={<AdminQuiz />} />
                  </Route>
                  <Route path="*" element={<h1 className="text-center py-5 font-extrabold">Sorry for the inconvenience. CricABC will develop this page soon...</h1>} />
                </Routes>
              </Suspense>
              </MatchesProvider>
              </PlayerProvider>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;