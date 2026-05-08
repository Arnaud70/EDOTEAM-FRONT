import { useState, useEffect } from 'react';
import { Menu, X, Globe, Search, ArrowRight, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
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
            <a href="#how" className="text-slate-600 hover:text-elite-emerald font-semibold transition-colors text-sm uppercase tracking-wider whitespace-nowrap">Concept</a>
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 h-screen animate-in slide-in-from-top duration-500">
          <div className="px-6 pt-10 pb-20 space-y-6">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-black text-slate-900">Accueil</Link>
            <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-black text-slate-900">Explorer</Link>
            <a href="#how" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-black text-slate-900">Concept</a>
            {isAuthenticated && (
              <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-black text-elite-emerald flex items-center gap-4">
                <MessageSquare size={32} />
                Messages
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-black text-slate-900">
                Dashboard
              </Link>
            )}
            
            <div className="pt-10 flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-center text-elite-emerald font-black text-xl border-2 border-elite-emerald rounded-2xl">Connexion</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-center bg-elite-emerald text-white font-black text-xl rounded-2xl shadow-premium">Commencer</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

