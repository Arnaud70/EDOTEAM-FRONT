import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    nom: string;
    prenom: string;
  };
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, provider }) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      setIsSending(true);
      await api.post('/messages', {
        receiverId: provider.id,
        content: content.trim()
      });
      setIsSuccess(true);
      // Wait for success animation then navigate
      setTimeout(() => {
        onClose();
        navigate('/messages');
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Impossible d\'envoyer le message pour le moment.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-premium overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-elite-emerald/5 rounded-2xl flex items-center justify-center text-elite-emerald shadow-inner">
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      Contacter {provider.prenom}
                    </h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                      Demande d'étude personnalisée
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-12 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-elite-emerald/10 text-elite-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-elite-emerald/10 border border-elite-gold/20"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Message Envoyé !</h4>
                  <p className="text-slate-500 font-medium">Redirection vers vos conversations...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-4">
                      Votre Message
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`Bonjour ${provider.prenom}, je souhaiterais obtenir plus d'informations sur vos services...`}
                      className="w-full min-h-[160px] p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-slate-900 placeholder-slate-300 font-medium focus:ring-4 focus:ring-elite-emerald/10 focus:border-elite-gold/30 outline-none transition-all resize-none shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      onClick={handleSend}
                      disabled={!content.trim() || isSending}
                      className="w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-2xl hover:bg-elite-emerald transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:scale-100 flex items-center justify-center gap-4 group"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin text-elite-gold" size={24} />
                      ) : (
                        <>
                          Envoyer le message
                          <Send size={18} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Sécurisé par EDOTEAM Excellence
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;
