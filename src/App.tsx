import React, { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import HowItWorks from './components/HowItWorks';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { MobileMenuButton } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';
import { MessageSquare } from 'lucide-react';
import NotificationDropdown from './components/NotificationDropdown';
import LoadingScreen from './components/LoadingScreen';
import InstallationBanner from './components/InstallationBanner';
import { useAuth } from './context/AuthContext';

const ServiceList = lazy(() => import('./pages/ServiceList'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PrestataireProfile = lazy(() => import('./pages/PrestataireProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Messaging = lazy(() => import('./pages/Messaging'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminServices = lazy(() => import('./pages/AdminServices'));
const AdminAlerts = lazy(() => import('./pages/AdminAlerts'));
const Bookings = lazy(() => import('./pages/Bookings'));
const ProviderServices = lazy(() => import('./pages/ProviderServices'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Security = lazy(() => import('./pages/Security'));
const Settings = lazy(() => import('./pages/Settings'));
const Favorites = lazy(() => import('./pages/Favorites'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));
const ProviderAvailability = lazy(() => import('./pages/ProviderAvailability'));
const Reports = lazy(() => import('./pages/Reports'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Devis = lazy(() => import('./pages/Devis'));
const FAQ = lazy(() => import('./pages/FAQ'));

const DASHBOARD_PATHS = [
  '/dashboard', '/messages', '/admin', '/provider',
  '/bookings', '/devis', '/wallet', '/security', '/favorites', '/settings', '/reports'
];

// Pages "seules" : ni navbar ni footer (comme l'inscription).
const STANDALONE_PATHS = [
  '/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/complete-profile',
];

const isUserProfileComplete = (user: any) => {
  if (!user || user.role === 'ADMIN') {
    return true;
  }

  const hasPhone = !!user.telephone && user.telephone.trim().length > 0;
  const hasLocation = !!user.localisation && user.localisation.trim().length > 0;
  const hasProfessionalTitle = user.role !== 'PRESTATAIRE' || (!!user.titreProfessionnel && user.titreProfessionnel.trim().length > 0);
  const hasDocument = user.role !== 'PRESTATAIRE' || !!user.media?.some((m: any) => m.type === 'DOCUMENT');

  return hasPhone && hasLocation && hasProfessionalTitle && hasDocument;
};

const Home = () => (
  <>
    <Hero />
    <FeaturedCategories />
    <HowItWorks />
  </>
);

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();
  const shouldHideFooter =
    DASHBOARD_PATHS.some(p => location.pathname.startsWith(p)) ||
    STANDALONE_PATHS.some(p => location.pathname.startsWith(p)) ||
    (!!user && !isUserProfileComplete(user));
  if (shouldHideFooter) return null;
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-24 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-8" />
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium leading-relaxed">
              L'excellence du service de proximité au Togo.
              Une plateforme premium pour des prestations d'exception.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-8 text-elite-emerald uppercase tracking-widest text-xs">Services</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
              <li><a href="#" className="hover:text-elite-gold transition-colors">Plomberie Elite</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Électricité</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Conciergerie</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Climatisation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-elite-emerald uppercase tracking-widest text-xs">Exclusivité</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
              <li><a href="/dashboard" className="hover:text-elite-gold transition-colors">Tableau de Bord</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Devenir Partenaire</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">EDOTEAM Plus</a></li>
              <li><a href="#" className="hover:text-elite-gold transition-colors">Assistance 24/7</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
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

// Global Top Mobile Header for Dashboard
const MobileDashboardHeader = () => {
  const location = useLocation();
  if (!DASHBOARD_PATHS.some(p => location.pathname.startsWith(p))) return null;
  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-[72px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 flex items-center justify-between px-4 shadow-sm">
        <MobileMenuButton />
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <Link to="/messages" className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-elite-emerald transition-colors">
            <MessageSquare size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-elite-gold rounded-full border-2 border-white" />
          </Link>
        </div>
      </div>
      {/* Réserve l'espace occupé par la barre fixed ci-dessus, pour que le contenu qui suit
          (dont le PageHeader désormais non-fixed sur mobile) ne passe pas dessous. */}
      <div className="lg:hidden h-[72px]" />
    </>
  );
};

const PwaInstallPrompt = () => {
  return null;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isProfileIncomplete = !!user && !isUserProfileComplete(user);
  const hideNavbar =
    DASHBOARD_PATHS.some(p => location.pathname.startsWith(p)) ||
    STANDALONE_PATHS.some(p => location.pathname.startsWith(p)) ||
    isProfileIncomplete;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {!hideNavbar && <Navbar />}
      <MobileDashboardHeader />
      <main>{children}</main>
      <Footer />
      <InstallationBanner />
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    // Si y a un hash, scroll vers l'élément
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Sinon, scroll vers le top
      window.scrollTo(0, 0);
      const mainContent = document.querySelector('.layout-main');
      if (mainContent) {
        mainContent.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);
  
  return null;
};

const AppContent = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <AppRouter user={user} />
    </Router>
  );
};

const AppRouter = ({ user }: { user: any }) => {
  const location = useLocation();
  const isProfileIncomplete = !!user && !isUserProfileComplete(user);

  if (isProfileIncomplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
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
            <Route path="/devis" element={<ProtectedRoute><Devis /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

            {/* Role Specific Routes */}
            <Route path="/provider/services" element={<ProtectedRoute allowedRoles={['PRESTATAIRE']}><ProviderServices /></ProtectedRoute>} />
            <Route path="/provider/availability" element={<ProtectedRoute allowedRoles={['PRESTATAIRE']}><ProviderAvailability /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute allowedRoles={['CLIENT']}><Favorites /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};

function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SidebarProvider>
  );
}

export default App;
