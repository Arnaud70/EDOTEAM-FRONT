import React, { useState } from 'react';
import { Star, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface AvisModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
}

const AvisModal = ({ isOpen, onClose, providerId, providerName, onSuccess }: AvisModalProps) => {
  const [note, setNote] = useState(5);
  const [hoveredNote, setHoveredNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/avis', {
        prestataireId: providerId,
        note,
        commentaire,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre avis.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-8 lg:p-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Votre <span className="gold-accent">Avis</span>
              </h2>
              <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-500 font-medium mb-8">
              Comment s'est passée votre expérience avec <span className="text-slate-900 font-bold">{providerName}</span> ?
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center gap-4 py-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredNote(star)}
                      onMouseLeave={() => setHoveredNote(0)}
                      onClick={() => setNote(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        size={40}
                        className={star <= (hoveredNote || note) ? "text-elite-gold" : "text-slate-200"}
                        fill={star <= (hoveredNote || note) ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {note === 5 ? 'Excellent' : note === 4 ? 'Très Bien' : note === 3 ? 'Bien' : note === 2 ? 'Moyen' : 'Passable'}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-2">Commentaire (Optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Partagez les détails de votre collaboration..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 min-h-[150px] outline-none focus:ring-2 ring-elite-emerald/10 font-medium text-slate-900 placeholder:text-slate-300 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl flex items-center justify-center gap-4 hover:bg-elite-emerald transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Publier l'avis
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AvisModal;
