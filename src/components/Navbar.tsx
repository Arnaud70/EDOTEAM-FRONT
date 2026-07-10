import { useState, useEffect } from 'react';
import { Menu, X, Globe, Search, ArrowRight, MessageSquare, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data || response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      }
    };

    fetchServices();
  }, []);

  const handleConceptClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Si on est sur la page d'accueil, scroller vers la section
    if (location.pathname === '/') {
      const element = document.getElementById('how');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Sinon, aller à la page d'accueil et scroller après le chargement
      navigate('/#how');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleCategoryClick = (serviceName: string) => {
    navigate(`/services?q=${encodeURIComponent(serviceName)}`);
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-premium py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="dark" className={isScrolled ? 'scale-90 transition-transform' : 'scale-100 transition-transform'} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-slate-600 hover:text-elite-emerald font-semibold transition-colors text-sm uppercase tracking-wider">Accueil</Link>
            <Link to="/services" className="text-slate-600 hover:text-elite-emerald font-semibold transition-colors text-sm uppercase tracking-wider">Explorer</Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-slate-600 hover:text-elite-emerald font-semibold transition-colors text-sm uppercase tracking-wider flex items-center gap-1"
              >
                Catégories
                <ChevronDown size={16} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div className={`absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-premium border border-slate-100 transition-all duration-300 py-2 z-50 max-h-96 overflow-y-auto ${isCategoriesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                {services.length === 0 ? (
                  <div className="px-6 py-4 text-slate-500 text-sm">Chargement des catégories...</div>
                ) : (
                  services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleCategoryClick(service.nom)}
                      className="w-full px-6 py-2.5 text-left text-slate-700 hover:bg-elite-emerald/10 hover:text-elite-emerald font-semibold transition-colors text-sm"
                    >
                      {service.nom}
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <button 
              onClick={handleConceptClick}
              className="text-slate-600 hover:text-elite-emerald font-semibold transition-colors text-sm uppercase tracking-wider"
            >
              Concept
            </button>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/messages" 
                    className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-elite-emerald hover:text-white transition-all shadow-premium"
                    title="Messages"
                  >
                    <MessageSquare size={20} />
                  </Link>
                  <NotificationDropdown />
                </div>
                <Link 
                  to="/dashboard"
                  className="px-6 py-3 bg-elite-emerald/10 text-elite-emerald font-bold rounded-xl hover:bg-elite-emerald hover:text-white transition-all"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-premium hover:bg-red-600 transition-all"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-900 font-bold hover:text-elite-emerald transition-colors">
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-8 py-3 bg-elite-emerald text-white font-bold rounded-xl shadow-premium hover:bg-elite-emerald/90 transition-all flex items-center gap-2 group"
                >
                  C'est parti
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-elite-emerald"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 h-[calc(100vh-80px)] overflow-y-auto animate-in slide-in-from-top duration-500">
          <div className="px-6 pt-8 pb-10 space-y-5">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-bold text-slate-800 hover:text-elite-emerald transition-colors">Accueil</Link>
            <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-bold text-slate-800 hover:text-elite-emerald transition-colors">Explorer</Link>
            
            {/* Mobile Categories */}
            <div>
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="block text-2xl font-bold text-slate-800 hover:text-elite-emerald transition-colors flex items-center gap-2"
              >
                Catégories
                <ChevronDown size={20} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriesOpen && (
                <div className="mt-4 pl-4 space-y-3 border-l-2 border-elite-emerald">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleCategoryClick(service.nom)}
                      className="block text-lg font-semibold text-slate-700 hover:text-elite-emerald transition-colors"
                    >
                      {service.nom}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleConceptClick}
              className="block text-2xl font-bold text-slate-800 hover:text-elite-emerald transition-colors"
            >
              Concept
            </button>
            
            {isAuthenticated && (
              <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-elite-emerald flex items-center gap-3">
                <MessageSquare size={24} />
                Messages
              </Link>
            )}
            
            <div className="pt-6 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full py-3.5 text-center bg-elite-emerald/10 text-elite-emerald font-bold text-lg rounded-xl hover:bg-elite-emerald hover:text-white transition-colors">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full py-3.5 text-center bg-slate-900 text-white font-bold text-lg rounded-xl shadow-premium hover:bg-red-600 transition-colors">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-3.5 text-center text-elite-emerald font-bold text-lg border-2 border-elite-emerald rounded-xl hover:bg-elite-emerald/5 transition-colors">Connexion</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-3.5 text-center bg-elite-emerald text-white font-bold text-lg rounded-xl shadow-premium hover:bg-elite-emerald/90 transition-colors">Commencer</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

