import React, { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Bell, Search, ChevronRight, ShieldCheck, CreditCard, Users, Star, TrendingUp, AlertCircle, Settings, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar, { MobileMenuButton } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Bonne route : /admin/stats
        const response = await api.get('/admin/stats');
        setStats(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-elite-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-emerald/5 rounded-2xl flex items-center justify-center text-elite-emerald group-hover:bg-elite-emerald group-hover:text-white transition-all">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Utilisateurs</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.utilisateurs?.total ?? stats?.totalUsers ?? 0}</h3>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-gold/10 rounded-2xl flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
            <Star size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Prestataires</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.utilisateurs?.prestataires ?? stats?.totalPrestataires ?? 0}</h3>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Services</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.services ?? stats?.totalServices ?? 0}</h3>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all border-amber-100 bg-amber-50/30">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Alertes</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.signalements?.enAttente ?? stats?.pendingReports ?? 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <section className="glass-card p-8 rounded-[2.5rem]">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Nouveaux Prestataires à Valider</h2>
          <div className="py-10 text-center text-slate-300">
             <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest">Aucune validation en attente</p>
          </div>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem]">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Dernières Activités Admin</h2>
          <div className="py-10 text-center text-slate-300">
             <Settings size={48} className="mx-auto mb-4 opacity-20" />
             <Link to="/admin/logs" className="text-[10px] font-black uppercase tracking-widest text-elite-emerald hover:underline">
               Voir le journal d'audit →
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── PROVIDER DASHBOARD ──────────────────────────────────────────────────────

const ProviderDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/profile');
        const profile = response.data.data || response.data;
        setStats({
          totalServices: profile.services?.length ?? 0,
          totalReviews: profile.receivedReviews?.length ?? 0,
          totalAvailabilities: profile.availability?.length ?? 0,
        });
      } catch (error) {
        console.error('Error fetching provider stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-elite-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-emerald/5 rounded-2xl flex items-center justify-center text-elite-emerald group-hover:bg-elite-emerald group-hover:text-white transition-all">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Services Proposés</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.totalServices ?? 0}</h3>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-gold/10 rounded-2xl flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Disponibilités</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.totalAvailabilities ?? 0}</h3>
          </div>
        </div>

        <div className="bg-elite-emerald p-8 rounded-[2rem] text-white flex items-center gap-6 shadow-premium hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-elite-gold">
            <Star size={28} />
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Avis Reçus</p>
            <h3 className="text-2xl font-black">{stats?.totalReviews ?? 0}</h3>
          </div>
        </div>
      </div>

      <section className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-elite-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-elite-gold/10 rounded-[2rem] flex items-center justify-center text-elite-gold shadow-inner">
            <Settings size={40} className="group-hover:rotate-90 transition-transform duration-700" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Configurez votre Profil Public</h2>
            <p className="text-slate-500 font-medium mb-6 max-w-lg">
              Ajoutez votre bio, votre titre professionnel et vos plus belles réalisations pour attirer plus de clients.
            </p>
            <Link to="/settings" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald transition-all shadow-xl group/btn">
              Configurer mon profil
              <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── CLIENT DASHBOARD ────────────────────────────────────────────────────────

const ClientDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, walletRes] = await Promise.allSettled([
          api.get('/bookings'),
          api.get('/wallet'),
        ]);

        const bookings = bookingsRes.status === 'fulfilled'
          ? (bookingsRes.value.data?.data || bookingsRes.value.data || [])
          : [];
        const wallet = walletRes.status === 'fulfilled'
          ? (walletRes.value.data?.data || walletRes.value.data)
          : null;

        setStats({
          totalBookings: Array.isArray(bookings) ? bookings.length : 0,
          balance: wallet?.balance ?? 0,
        });
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-elite-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-emerald/5 rounded-2xl flex items-center justify-center text-elite-emerald group-hover:bg-elite-emerald group-hover:text-white transition-all">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mes Réservations</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.totalBookings ?? 0}</h3>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-elite-gold/10 rounded-2xl flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Balance</p>
            <h3 className="text-3xl font-black text-slate-900">
              {(stats?.balance ?? 0).toLocaleString()} <span className="text-xs uppercase">F</span>
            </h3>
          </div>
        </div>

        <div className="bg-elite-emerald p-8 rounded-[2rem] text-white flex items-center gap-6 shadow-premium hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-elite-gold">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Statut Compte</p>
            <h3 className="text-2xl font-black">Vérifié Elite</h3>
          </div>
        </div>
      </div>

      <section className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-elite-emerald/5 rounded-[2rem] flex items-center justify-center text-elite-emerald shadow-inner">
            <Search size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Trouvez votre prestataire idéal</h2>
            <p className="text-slate-500 font-medium mb-6 max-w-lg">
              Des centaines d'experts vérifiés sont disponibles pour vous accompagner dans vos projets.
            </p>
            <Link to="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald transition-all shadow-xl group/btn">
              Explorer les services
              <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <MobileMenuButton />
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
                Bonjour, <span className="gold-accent">{user.prenom || user.nom}</span> 👋
              </h1>
              <p className="text-slate-500 font-medium">
                {user.role?.toUpperCase() === 'ADMIN' ? 'Espace Administration Super Admin' :
                 user.role?.toUpperCase() === 'PRESTATAIRE' ? 'Gestion de vos prestations Elite' :
                 'Bon retour sur EDOTEAM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm focus-within:ring-2 ring-elite-emerald/10 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm w-48 font-medium" />
            </div>

            <button className="relative p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-elite-emerald hover:border-elite-emerald/30 transition-all shadow-sm group">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <Link to="/settings" className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-premium bg-slate-100 flex items-center justify-center font-black text-slate-900 hover:scale-105 transition-all">
              {user.photoUrl ? <img src={user.photoUrl} alt="Profil" className="w-full h-full object-cover" /> : (user.nom?.[0] || 'U')}
            </Link>
          </div>
        </header>

        {user.role?.toUpperCase() === 'ADMIN' && <AdminDashboard />}
        {user.role?.toUpperCase() === 'PRESTATAIRE' && <ProviderDashboard />}
        {user.role?.toUpperCase() === 'CLIENT' && <ClientDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
