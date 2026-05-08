import React, { useRef, useEffect } from 'react';
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
  Terminal,
  Clock,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebar();
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  if (!user) return null;

  // Ferme le drawer mobile quand on change de page
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  // Auto-scroll vers le lien actif
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const role = user.role?.toUpperCase() || 'CLIENT';
    switch (role) {
      case 'ADMIN':
        return [
          { icon: Home, label: 'Voir le site public', path: '/' },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
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
          { icon: Briefcase, label: 'Mes Services', path: '/provider/services' },
          { icon: Clock, label: 'Disponibilités', path: '/provider/availability' },
          { icon: Calendar, label: 'Réservations', path: '/bookings' },
          { icon: MessageSquare, label: 'Messages', path: '/messages' },
          { icon: CreditCard, label: 'Portefeuille', path: '/wallet' },
          { icon: Settings, label: 'Paramètres', path: '/settings' },
          { icon: ShieldCheck, label: 'Sécurité', path: '/security' },
        ];
      default:
        return [
          { icon: Home, label: 'Voir le site public', path: '/' },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: Calendar, label: 'Mes Réservations', path: '/bookings' },
          { icon: MessageSquare, label: 'Messages', path: '/messages' },
          { icon: Heart, label: 'Favoris', path: '/favorites' },
          { icon: CreditCard, label: 'Portefeuille', path: '/wallet' },
          { icon: Settings, label: 'Paramètres', path: '/settings' },
          { icon: ShieldCheck, label: 'Sécurité', path: '/security' },
        ];
    }
  };

  const menuItems = getMenuItems();

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
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
          >
            <X size={18} />
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
                <span className="text-sm whitespace-nowrap">{item.label}</span>
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
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center font-black text-white text-sm flex-shrink-0">
              {user.nom?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate">{user.nom} {user.prenom}</p>
              <p className="text-[9px] font-bold text-elite-gold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
        )}
        {!mobile && isCollapsed && (
          <div
            title={`${user.nom} ${user.prenom} • ${user.role}`}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center font-black text-white text-sm"
          >
            {user.nom?.[0] || 'A'}
          </div>
        )}
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

// Bouton hamburger exporté séparément pour être utilisé dans le header de chaque page
export const MobileMenuButton = () => {
  const { toggleMobile } = useSidebar();
  return (
    <button
      onClick={toggleMobile}
      className="lg:hidden p-3 bg-elite-emerald text-white rounded-xl shadow-lg hover:bg-elite-emerald/90 transition-all active:scale-95"
      title="Ouvrir le menu"
    >
      <Menu size={22} />
    </button>
  );
};

export default Sidebar;
