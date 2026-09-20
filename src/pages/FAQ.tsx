import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const faqs = [
  {
    category: 'Devis et négociation',
    questions: [
      ['Comment demander un devis ?', 'Ouvrez le profil d’un prestataire, choisissez le service, décrivez votre besoin, indiquez le lieu et le créneau souhaité, puis envoyez votre demande. Vous pouvez joindre jusqu’à cinq photos.'],
      ['Puis-je modifier une demande de devis ?', 'Oui. Tant que la demande est encore en attente, vous pouvez modifier sa description, son lieu et ses disponibilités depuis la page Mes devis.'],
      ['Que se passe-t-il si le prix dépasse mon budget ?', 'Choisissez un motif lié au prix lors du refus. Le devis passe en négociation et vous pouvez écrire directement au prestataire pour proposer votre budget.'],
      ['Combien de temps faut-il pour recevoir une réponse ?', 'Le délai dépend du prestataire. Vous recevez une notification dès qu’il répond avec un prix ou un message.'],
    ],
  },
  {
    category: 'Réservations',
    questions: [
      ['Puis-je modifier une demande de rendez-vous ?', 'Oui, uniquement lorsque le rendez-vous est encore en attente. Vous pouvez modifier la date, les horaires, l’adresse et votre note.'],
      ['Pourquoi un créneau est-il refusé ?', 'Le créneau peut être passé, hors des disponibilités du prestataire ou déjà réservé par une autre personne.'],
      ['Quand la réservation est-elle confirmée ?', 'Le prestataire doit d’abord accepter la demande. Il peut ensuite confirmer le rendez-vous selon le workflow de la plateforme.'],
      ['Mes photos sont-elles visibles par le prestataire ?', 'Oui. Les photos ajoutées à une réservation sont enregistrées avec la demande et visibles dans le détail de la réservation.'],
    ],
  },
  {
    category: 'Prestataires',
    questions: [
      ['Comment ajouter un service ?', 'Depuis Services proposés, sélectionnez un service actif, ajoutez votre tarif indicatif et vos informations d’expérience.'],
      ['Comment gérer mes disponibilités ?', 'La page Disponibilités vous permet de définir les jours et horaires pendant lesquels les clients peuvent demander une intervention.'],
      ['Comment répondre à une demande ?', 'Dans Mes devis, ouvrez une demande en attente, indiquez votre prix et ajoutez les détails utiles avant de l’envoyer au client.'],
    ],
  },
  {
    category: 'Compte et sécurité',
    questions: [
      ['Comment protéger mon compte ?', 'Utilisez un mot de passe robuste, vérifiez votre adresse email et ne partagez jamais vos codes de sécurité.'],
      ['Comment contacter un utilisateur ?', 'La messagerie intégrée permet d’échanger avec un client ou un prestataire sans partager immédiatement vos coordonnées personnelles.'],
      ['Que faire en cas de problème ?', 'Utilisez le centre de signalement ou contactez l’équipe EDOTEAM depuis votre espace.'],
    ],
  },
];

const FAQ = () => {
  const [openKey, setOpenKey] = useState('Devis et négociation-0');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] font-sans">
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-6 lg:px-12 lg:pt-32">
        <div className="mx-auto max-w-6xl">
          <PageHeader title={<>Questions <span className="gold-accent">fréquentes</span></>} subtitle="Les réponses essentielles pour utiliser EDOTEAM sereinement." />
        </div>
        <div className="mx-auto max-w-4xl space-y-8 pt-6">
          <div className="rounded-[2rem] bg-elite-emerald p-8 text-white shadow-premium sm:p-10">
            <div className="flex items-start gap-5">
              <HelpCircle size={34} className="mt-1 shrink-0 text-elite-gold" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-100">Centre d’aide EDOTEAM</p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">Tout comprendre en quelques réponses</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50">Retrouvez les règles du parcours devis, des rendez-vous, de la négociation et de votre compte.</p>
              </div>
            </div>
          </div>

          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-elite-emerald">{section.category}</h2>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {section.questions.map(([question, answer], index) => {
                  const key = `${section.category}-${index}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <button type="button" onClick={() => setOpenKey(isOpen ? '' : key)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <span className="text-sm font-black text-slate-800 dark:text-white">{question}</span>
                        <ChevronDown size={19} className={`shrink-0 text-elite-emerald transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && <p className="px-6 pb-5 text-sm leading-6 text-slate-500 dark:text-slate-400">{answer}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQ;
