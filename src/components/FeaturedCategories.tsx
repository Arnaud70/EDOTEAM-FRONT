import { Wrench, Zap, Paintbrush, Home, Car, Scissors, ShieldCheck, GraduationCap, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Plomberie', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', count: 124 },
  { name: 'Électricité', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', count: 86 },
  { name: 'Peinture', icon: Paintbrush, color: 'text-purple-600', bg: 'bg-purple-50', count: 65 },
  { name: 'Ménage', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50', count: 210 },
  { name: 'Mécanique', icon: Car, color: 'text-slate-600', bg: 'bg-slate-50', count: 45 },
  { name: 'Beauté', icon: Scissors, color: 'text-pink-600', bg: 'bg-pink-50', count: 156 },
  { name: 'Sécurité', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50', count: 32 },
  { name: 'Éducation', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', count: 112 },
];

const FeaturedCategories = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Explorer par <span className="text-elite-emerald">Catégorie</span>
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Une sélection rigoureuse des meilleurs talents pour répondre à tous vos besoins, 
              du quotidien aux projets les plus complexes.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 font-black rounded-xl hover:bg-elite-emerald hover:text-white transition-all group">
            Toutes les catégories
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <div 
              key={i}
              className="group glass-card p-8 rounded-[2.5rem] hover:border-elite-gold/30 transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 ${cat.bg} ${cat.color} rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-elite-emerald group-hover:text-white group-hover:rotate-6 shadow-sm`}>
                <cat.icon size={36} />
              </div>
              <h3 className="font-black text-slate-900 mb-1 text-lg">{cat.name}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{cat.count} VERIFIÉS</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;

