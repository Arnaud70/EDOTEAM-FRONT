import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import HowItWorks from './components/HowItWorks';
import ServiceList from './pages/ServiceList';
import Login from './pages/Login';
import Register from './pages/Register';
import PrestataireProfile from './pages/PrestataireProfile';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { MobileMenuButton } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Messaging from './pages/Messaging';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminAlerts from './pages/AdminAlerts';
import Bookings from './pages/Bookings';
import ProviderServices from './pages/ProviderServices';
import Wallet from './pages/Wallet';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import AdminLogs from './pages/AdminLogs';
import ProviderAvailability from './pages/ProviderAvailability';

const DASHBOARD_PATHS = [
  '/dashboard', '/messages', '/admin', '/provider',
  '/bookings', '/wallet', '/security', '/favorites', '/settings'
];

const Home = () => (
  <>
    <Hero />
    <FeaturedCategories />
    <HowItWorks />
  </>
);

const Footer = () => {
  const location = useLocation();
  if (DASHBOARD_PATHS.some(p => location.pathname.startsWith(p))) return null;
  return (
    <footer className="bg-white border-t border-slate-100 py-24 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-8" />
            <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
              L'excellence du service de proximité au Togo.
              Une plateforme premium pour des prestations d'exception.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-8 text-elite-emerald uppercase tracking-widest text-xs">Services</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="#" className="hover:text-elite-gold transition-colors">Plomberie Elite</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Électricité</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Conciergerie</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Climatisation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-elite-emerald uppercase tracking-widest text-xs">Exclusivité</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="/dashboard" className="hover:text-elite-gold transition-colors">Tableau de Bord</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Devenir Partenaire</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">EDOTEAM Plus</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Assistance 24/7</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 EDOTEAM. Signature de Qualité.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-elite-emerald transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-elite-emerald transition-colors">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Bouton hamburger flottant en bas à gauche — visible uniquement sur mobile dans les pages dashboard
const FloatingMenuButton = () => {
  const location = useLocation();
  if (!DASHBOARD_PATHS.some(p => location.pathname.startsWith(p))) return null;
  return (
    <div className="fixed bottom-6 left-6 z-40 lg:hidden">
      <MobileMenuButton />
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavbar = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));
  return (
    <div className="min-h-screen bg-white">
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      <Footer />
      <FloatingMenuButton />
    </div>
  );
};

function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServiceList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:id" element={<PrestataireProfile />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminServices /></ProtectedRoute>} />
              <Route path="/admin/alerts" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAlerts /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLogs /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

              {/* Shared Routes */}
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Role Specific Routes */}
              <Route path="/provider/services" element={<ProtectedRoute allowedRoles={['PRESTATAIRE']}><ProviderServices /></ProtectedRoute>} />
              <Route path="/provider/availability" element={<ProtectedRoute allowedRoles={['PRESTATAIRE']}><ProviderAvailability /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute allowedRoles={['CLIENT']}><Favorites /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </SidebarProvider>
  );
}

export default App;
