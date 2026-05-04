import React from 'react';
import Sidebar from '../components/Sidebar';
import { Heart, Search, Star, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Favorites = () => {
  const { user } = useAuth();

  // Mock favorites
  const favorites = [
    { id: 1, name: "Koffi Mensah", service: "Électricien Expert", rating: 4.8, reviews: 124, price: "5000 F/h", location: "Lomé" },
    { id: 2, name: "Afiwa Dogbe", service: "Nettoyage Premium", rating: 4.9, reviews: 89, price: "8000 F/h", location: "Kpalimé" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
              Mes <span className="gold-accent">Favoris</span>
            </h1>
            <p className="text-slate-500 font-medium">Retrouvez rapidement vos prestataires préférés</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav, index) => (
            <motion.div 
              key={fav.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card group p-8 rounded-[3rem] bg-white border-none shadow-premium hover:-translate-y-2 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <Heart size={24} className="text-red-500 fill-red-500" />
              </div>

              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-slate-300 text-xl mb-6">
                {fav.name[0]}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{fav.name}</h3>
              <p className="text-elite-emerald font-bold text-sm mb-6">{fav.service}</p>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-elite-gold fill-elite-gold" />
                    <span className="text-xs font-black text-slate-900">{fav.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-xs font-bold">{fav.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <p className="font-black text-slate-950 uppercase text-sm">{fav.price}</p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-elite-emerald hover:gap-4 transition-all">
                    Réserver <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Favorites;
