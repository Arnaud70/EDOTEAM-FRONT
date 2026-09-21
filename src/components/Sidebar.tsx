import React, { useRef, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Users,
  Star,
  AlertCircle,
  Settings,
  Briefcase,
  CreditCard,
  Heart,
  PieChart,
  Terminal,
  Clock,
  Home,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import DefaultAvatar from './DefaultAvatar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Ferme le drawer mobile quand on change de page
  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const fetchBadgeCounts = async () => {
      try {
        const [messagesResponse, notificationsResponse, bookingsResponse] = await Promise.all([
          api.get('/messages/unread/count'),
          api.get('/notifications/unread-count'),
          api.get('/bookings'),
        ]);
        const messagesCount = messagesResponse.data?.data ?? messagesResponse.data ?? 0;
        const notificationsCount = notificationsResponse.data?.data ?? notificationsResponse.data ?? 0;
        const bookings = bookingsResponse.data?.data ?? bookingsResponse.data ?? [];
        if (!cancelled) {
          setUnreadMessages(Number(messagesCount) || 0);
          setUnreadNotifications(Number(notificationsCount) || 0);
          setPendingBookings(Array.isArray(bookings) ? bookings.filter((booking) => booking.status === 'PENDING').length : 0);
        }
      } catch {
        if (!cancelled) {
          setUnreadMessages(0);
          setUnreadNotifications(0);
          setPendingBookings(0);
        }
      }
    };

    fetchBadgeCounts();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Auto-scroll vers le lien actif
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  if (!user) return null;
  const currentUser = user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const role = currentUser.role?.toUpperCase() || 'CLIENT';
    switch (role) {
      case 'ADMIN':
        return [
          { icon: Home, label: 'Voir le site public', path: '/' },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: PieChart, label: 'Rapports', path: '/reports' },
          { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
          { icon: Star, label: 'Services', path: '/admin/services' },
          { icon: AlertCircle, label: 'Sécurité', path: '/admin/alerts' },
          { icon: Terminal, label: 'Logs Sécurité', path: '/admin/logs' },
          { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
        ];
      case 'PRESTATAIRE':
        return [
          { icon: Home, label: 'Voir le site public', path: '/' },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: PieChart, label: 'Rapports', path: '/reports' },
          { icon: Briefcase, label: 'Mes Services', path: '/provider/services' },
          { icon: Clock, label: 'Disponibilités', path: '/provider/availability' },
          { icon: Calendar, label: 'Réservations', path: '/bookings' },
          { icon: ImageIcon, label: 'Devis', path: '/devis' },
          { icon: MessageSquare, label: 'Messages', path: '/messages' },
          { icon: CreditCard, label: 'Portefeuille', path: '/wallet' },
          { icon: Settings, label: 'Paramètres', path: '/settings' },
          { icon: ShieldCheck, label: 'Sécurité', path: '/security' },
        ];
      default:
        return [
          { icon: Home, label: 'Voir le site public', path: '/' },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: PieChart, label: 'Rapports', path: '/reports' },
          { icon: Calendar, label: 'Mes Réservations', path: '/bookings' },
          { icon: ImageIcon, label: 'Devis', path: '/devis' },
          { icon: MessageSquare, label: 'Messages', path: '/messages' },
          { icon: Heart, label: 'Favoris', path: '/favorites' },
          { icon: CreditCard, label: 'Portefeuille', path: '/wallet' },
          { icon: Settings, label: 'Paramètres', path: '/settings' },
          { icon: ShieldCheck, label: 'Sécurité', path: '/security' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getBadgeCount = (path: string) => {
    if (path === '/messages') return unreadMessages;
    if (path === '/bookings') return pendingBookings;
    if (path === '/dashboard' || path === '/admin/alerts') return unreadNotifications;
    return 0;
  };

  // ─── Contenu partagé (desktop + mobile) ───────────────────────────────────
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Header */}
      <div className={`flex items-center mb-10 pt-8 px-4 ${
        !mobile && isCollapsed ? 'justify-center' : 'justify-between px-6'
      }`}>
        {(mobile || !isCollapsed) && (
          <div className="flex-1">
            <Logo variant="light" />
          </div>
        )}
        {mobile ? (
          <button
            onClick={closeMobile}
            title="Réduire le menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <button
            onClick={toggle}
            title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        ref={navRef as React.RefObject<HTMLElement>}
        className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-3"
        style={{ overflowAnchor: 'none' }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const collapsed = !mobile && isCollapsed;
          return (
            <Link
              key={item.path}
              to={item.path}
              ref={isActive ? activeRef : undefined}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-4 px-3 py-3.5 rounded-2xl font-semibold transition-all group relative ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon
                size={20}
                className={`flex-shrink-0 ${isActive ? 'text-elite-gold' : 'group-hover:text-elite-gold'}`}
              />
              {!collapsed && (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="text-sm whitespace-nowrap">{item.label}</span>
                  {getBadgeCount(item.path) > 0 && (
                    <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black leading-4 text-white shadow-lg shadow-red-500/20">
                      {getBadgeCount(item.path) > 99 ? '99+' : getBadgeCount(item.path)}
                    </span>
                  )}
                </span>
              )}
              {collapsed && getBadgeCount(item.path) > 0 && (
                <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
                  {getBadgeCount(item.path) > 9 ? '9+' : getBadgeCount(item.path)}
                </span>
              )}
              {isActive && collapsed && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-elite-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`mt-auto pt-4 border-t border-white/10 px-3 pb-6 ${
        !mobile && isCollapsed ? 'flex flex-col items-center gap-3' : ''
      }`}>
        {(mobile || !isCollapsed) && (
          <div className="flex items-center gap-3 px-2 py-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/30 overflow-hidden flex-shrink-0">
              <DefaultAvatar photoUrl={currentUser.photoUrl} genre={currentUser.genre} iconClassName="w-1/2 h-1/2 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate">{currentUser.nom} {currentUser.prenom}</p>
              <p className="text-[9px] font-bold text-elite-gold uppercase tracking-widest">{currentUser.role}</p>
            </div>
          </div>
        )}
        {!mobile && isCollapsed && (
          <div
            title={`${currentUser.nom} ${currentUser.prenom} • ${currentUser.role}`}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/30 overflow-hidden"
          >
            <DefaultAvatar photoUrl={currentUser.photoUrl} genre={currentUser.genre} iconClassName="w-1/2 h-1/2 text-white" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => toggleTheme()}
            title={!mobile && isCollapsed ? (theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre') : undefined}
            className={`flex items-center gap-3 px-3 py-3 text-white/50 hover:text-white font-semibold transition-all rounded-2xl hover:bg-white/5 w-full ${!mobile && isCollapsed ? 'justify-center' : ''}`}
          >
            {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
            {(mobile || !isCollapsed) && (
              <span className="text-sm">
                {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleLogout}
          title={!mobile && isCollapsed ? 'Déconnexion' : undefined}
          className={`flex items-center gap-4 px-3 py-3 text-white/50 hover:text-red-400 font-semibold transition-all rounded-2xl hover:bg-white/5 w-full ${
            !mobile && isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {(mobile || !isCollapsed) && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-50 flex-col hidden lg:flex sidebar-transition ${
          isCollapsed ? 'w-20' : 'w-80'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer (overlay) ──────────────────────── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />
      {/* Drawer */}
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-50 w-80 flex flex-col lg:hidden sidebar-transition ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent mobile />
      </aside>
    </>
  );
};

// Bouton hamburger exporté séparément pour être utilisé dans le header mobile du dashboard.
// Icône ☰ classique (au lieu d'un chevron flottant sur le bord) pour rester reconnaissable
// et cohérent avec le hamburger de la navbar publique.
export const MobileMenuButton = () => {
  const { isMobileOpen, toggleMobile } = useSidebar();
  return (
    <button
      onClick={toggleMobile}
      aria-expanded={isMobileOpen}
      className="lg:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-elite-emerald/10 dark:bg-elite-emerald/20 text-elite-emerald hover:bg-elite-emerald hover:text-white transition-all active:scale-95 flex-shrink-0"
      title={isMobileOpen ? 'Masquer le menu' : 'Afficher le menu'}
      aria-label={isMobileOpen ? 'Masquer le menu' : 'Afficher le menu'}
    >
      {isMobileOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
    </button>
  );
};

export default Sidebar;
