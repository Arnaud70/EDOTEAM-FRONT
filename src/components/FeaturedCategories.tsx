import { useState, useEffect } from 'react';
import { Wrench, Zap, Paintbrush, Home, Car, Scissors, ShieldCheck, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const iconMap: { [key: string]: any } = {
  Plomberie: Wrench,
  Électricité: Zap,
  Peinture: Paintbrush,
  Ménage: Home,
  Mécanique: Car,
  Beauté: Scissors,
  Sécurité: ShieldCheck,
  Éducation: GraduationCap,
};

const colorMap: { [key: string]: { color: string; bg: string } } = {
  Plomberie: { color: 'text-blue-600', bg: 'bg-blue-50' },
  Électricité: { color: 'text-amber-500', bg: 'bg-amber-50' },
  Peinture: { color: 'text-purple-600', bg: 'bg-purple-50' },
  Ménage: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Mécanique: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' },
  Beauté: { color: 'text-pink-600', bg: 'bg-pink-50' },
  Sécurité: { color: 'text-rose-600', bg: 'bg-rose-50' },
  Éducation: { color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data || response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIcon = (serviceName: string) => iconMap[serviceName] || Wrench;
  const getColor = (serviceName: string) => colorMap[serviceName] || { color: 'text-blue-600', bg: 'bg-blue-50' };

  return (
    <section id="categories" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Explorer par <span className="text-elite-emerald">Catégorie</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
              Trouvez le talent qu'il vous faut parmi nos meilleures catégories.
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-elite-emerald hover:text-white transition-all text-sm group whitespace-nowrap"
          >
            Voir tout
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Horizontal Scrollable Grid */}
        <div className="overflow-x-auto pb-4 -mx-6 lg:-mx-12 px-6 lg:px-12 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {isLoading ? (
              <div className="flex justify-center py-8 w-full">
                <Loader2 size={28} className="animate-spin text-elite-emerald" />
              </div>
            ) : services.length > 0 ? (
              services.map((cat, i) => {
                const Icon = getIcon(cat.nom);
                const colors = getColor(cat.nom);
                return (
                  <button
                    key={cat.id || i}
                    onClick={() => navigate(`/services?q=${encodeURIComponent(cat.nom)}`)}
                    className="group flex-shrink-0 glass-card p-5 rounded-2xl hover:border-elite-gold/30 transition-all cursor-pointer flex flex-col items-center text-center w-32 border-none bg-transparent"
                  >
                    <div className={`w-16 h-16 ${colors.bg} ${colors.color} rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-110 group-hover:bg-elite-emerald group-hover:text-white shadow-sm`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-xs leading-tight">{cat.nom}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest">VERIFIÉS</p>
                  </button>
                );
              })
            ) : (
              <div className="w-full text-center py-8 text-slate-400 dark:text-slate-500">
                Aucun service disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;

