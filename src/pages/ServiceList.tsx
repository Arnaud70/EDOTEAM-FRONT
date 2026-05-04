import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShieldCheck, Heart, Filter, ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ServiceList = () => {
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPrestataires = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/users/search', {
          params: { q: search }
        });
        setPrestataires(response.data.data || response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des prestataires:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPrestataires();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
              Nos <span className="gold-accent">Experts</span> EDOTEAM
            </h1>
            <p className="text-slate-500 font-medium text-lg">Trouvez le talent d'exception pour vos besoins les plus exigeants.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm focus-within:ring-2 ring-elite-emerald/10 transition-all min-w-[300px]">
              <Search size={20} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher par service ou nom..." 
                className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-900 placeholder:text-slate-400" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-elite-emerald transition-all shadow-xl group">
              <SlidersHorizontal size={22} className="group-hover:text-elite-gold" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-elite-emerald mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Chargement des experts...</p>
          </div>
        ) : prestataires.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500 font-bold text-lg">Aucun prestataire disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {prestataires.map((p, i) => {
              const name = `${p.prenom || ''} ${p.nom || ''}`.trim();
              const role = p.titreProfessionnel || "Expert Prestataire";
              const prices = p.services?.map((s: any) => parseFloat(s.prixIndicatif)).filter((price: number) => !isNaN(price));
              const minPrice = prices?.length > 0 ? Math.min(...prices) : 0;
              const priceDisplay = minPrice > 0 ? `À partir de ${minPrice.toLocaleString()} F` : "Prix sur devis";
              const tags = p.services?.slice(0, 3).map((s: any) => s.service?.nom).filter(Boolean) || [];
              const image = p.photoUrl || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop";

              return (
                <div key={p.id || i} className="group glass-card rounded-[3rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-elite-emerald/10 border-elite-emerald/5">
                  <div className="relative h-64 overflow-hidden">
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <button className="absolute top-5 right-5 p-3 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-red-500 transition-all shadow-xl">
                      <Heart size={20} />
                    </button>
                    
                    {p.emailVerified && (
                      <div className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 bg-elite-emerald text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                        <ShieldCheck size={14} className="text-elite-gold" />
                        <span>Vérifié</span>
                      </div>
                    )}
                  </div>

                  <div className="p-8 lg:p-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1 lg:text-xl">{name || 'Anonyme'}</h3>
                        <p className="text-elite-emerald font-black text-xs tracking-[0.15em] uppercase flex items-center gap-2">
                           <span className="w-2 h-2 bg-elite-gold rounded-full" />
                           {role}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-elite-gold/10 px-3 py-1.5 rounded-xl text-elite-emerald font-black text-xs">
                        <Star size={16} fill="currentColor" className="text-elite-gold" />
                        <span>{p.rating || "5.0"}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <MapPin size={18} className="text-elite-gold" />
                        <span>{p.localisation || "Lomé"}</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">
                        {priceDisplay}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {tags.map((tag: string, j: number) => (
                        <span key={j} className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link to={`/profile/${p.id}`} className="flex items-center justify-between w-full p-5 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-3xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 group/btn uppercase tracking-widest text-xs">
                      Voir le profil Expert
                      <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;

