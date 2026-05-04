import { Search, MapPin, Shield, Star, Award, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden bg-[#F8FAFC]">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-elite-emerald/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-elite-gold/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-elite-emerald/5 border border-elite-emerald/10 text-elite-emerald rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-fade-in shadow-sm">
              <Award size={14} className="text-elite-gold" />
              <span>L'Excellence du Service au Togo</span>
            </div>
            
            <h1 className="text-5xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              L'Élite des <br />
              <span className="text-elite-emerald">Prestataires</span> <br />
              est ici.
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl font-medium">
              Accédez à un réseau exclusif de professionnels vérifiés. 
              De Lomé à Kara, l'assurance d'un service irréprochable pour votre domicile et bureau.
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-2xl p-2 bg-white rounded-[2rem] shadow-premium border border-slate-100 flex flex-col md:flex-row items-center gap-2 group focus-within:ring-4 ring-elite-emerald/5 transition-all">
              <div className="flex-1 w-full flex items-center px-6 py-4 gap-4 border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="text-slate-400 group-focus-within:text-elite-emerald transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Quel service recherchez-vous ?" 
                  className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-semibold"
                />
              </div>
              <button className="w-full md:w-auto px-10 py-4 bg-elite-emerald text-white font-black rounded-2xl shadow-xl shadow-elite-emerald/20 hover:bg-elite-emerald/90 transition-all transform hover:scale-[1.02] active:scale-95">
                Trouver
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-slate-400 font-bold text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-elite-gold" />
                Vérifié
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-elite-gold" />
                Premium
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-elite-gold" />
                Rapide
              </div>
            </div>
          </div>

          {/* Elegant Visual Element */}
          <div className="hidden lg:block flex-1 relative">
            <div className="w-full aspect-square rounded-[4rem] overflow-hidden rotate-3 shadow-premium border-[12px] border-white relative group">
              <img 
                src="/assets/images/worker-hero.png" 
                alt="Service" 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-elite-emerald/40 to-transparent" />
              
              {/* Floating Badge */}
              <div className="absolute -left-10 bottom-20 glass-card p-6 rounded-3xl -rotate-6 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-elite-gold rounded-2xl flex items-center justify-center text-elite-emerald font-black">
                    4.9
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Expert Qualifié</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">Lomé, Togo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

