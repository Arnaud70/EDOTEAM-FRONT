import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Send, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

const ContactAdmin = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get('/messages/admin-contact')
      .then((response) => setAdmin(response.data?.data ?? response.data))
      .catch(() => setFeedback('Le super administrateur est indisponible pour le moment.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!admin || !content.trim()) return;

    try {
      setIsSending(true);
      setFeedback('');
      await api.post('/messages', { receiverId: admin.id, content: content.trim() });
      setContent('');
      setFeedback('Votre message a été envoyé au super administrateur.');
    } catch (error: any) {
      setFeedback(error.response?.data?.message || 'Impossible d’envoyer le message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans">
      <Sidebar />
      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12">
        <PageHeader
          title={<>Contacter le <span className="gold-accent">super administrateur</span></>}
          subtitle="Une question ou un problème ? Envoyez-nous directement votre message."
          fixed
        />
        <section className="max-w-2xl glass-card rounded-[2.5rem] p-8 lg:p-12 shadow-premium">
          {isLoading ? (
            <Loader2 className="animate-spin text-elite-gold" size={32} />
          ) : admin ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-elite-emerald text-white flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Équipe EDOTEAM</p>
                  <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14} /> Super administrateur</p>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={1000}
                required
                rows={7}
                placeholder="Écrivez votre message..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 outline-none focus:ring-2 focus:ring-elite-emerald/20"
              />
              <div className="flex items-center justify-between gap-4">
                {feedback && <p className="text-sm font-bold text-elite-emerald">{feedback}</p>}
                <button
                  type="submit"
                  disabled={isSending || !content.trim()}
                  className="ml-auto flex items-center gap-2 rounded-2xl bg-elite-emerald px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Envoyer
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm font-bold text-red-600">{feedback}</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default ContactAdmin;
