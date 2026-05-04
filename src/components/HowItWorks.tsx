import { Search, UserCheck, MessageSquare, Star, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'Explorer',
    description: 'Parcourez nos catégories exclusives et trouvez le talent qui correspond à vos exigences.',
    icon: Search,
    color: 'text-elite-emerald',
    bg: 'bg-elite-emerald/5'
  },
  {
    title: 'Sélectionner',
    description: 'Consultez les portfolios et avis certifiés pour choisir le partenaire idéal en toute confiance.',
    icon: UserCheck,
    color: 'text-elite-gold',
    bg: 'bg-elite-gold/5'
  },
  {
    title: 'Collaborer',
    description: 'Échangez via notre messagerie sécurisée pour définir les modalités de la mission.',
    icon: MessageSquare,
    color: 'text-elite-emerald',
    bg: 'bg-elite-emerald/5'
  },
  {
    title: 'Évaluer',
    description: 'Partagez votre expérience pour maintenir l\'excellence de notre réseau Premium.',
    icon: Star,
    color: 'text-elite-gold',
    bg: 'bg-elite-gold/5'
  }
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Le Concept <span className="text-elite-gold">EDOTEAM</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Une approche simplifiée pour un service d'excellence. 
            Découvrez comment nous réinventons la mise en relation au Togo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-0 w-full h-[1px] bg-slate-200 -z-10" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className={`w-24 h-24 ${step.bg} ${step.color} rounded-[2rem] flex items-center justify-center mb-10 relative bg-white border border-slate-100 shadow-premium transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                <step.icon size={36} />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-elite-emerald text-white text-xs font-black flex items-center justify-center rounded-2xl shadow-xl shadow-elite-emerald/20">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                {step.description}
              </p>
              
              {i < steps.length - 1 && (
                <div className="md:hidden mt-8 text-slate-200">
                  <ArrowRight size={24} className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <button className="premium-button flex items-center gap-3 mx-auto group">
            Commencer l'expérience
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

