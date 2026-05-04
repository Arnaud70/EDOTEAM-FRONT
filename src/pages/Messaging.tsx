import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Info, User, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (activeChat) {
      const partner = activeChat.partner || activeChat.participants?.find((p: any) => p.user.id !== user?.id)?.user;
      if (partner) {
        fetchMessages(partner.id);
      }
    }
  }, [activeChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const partner = activeChat.partner || activeChat.participants?.find((p: any) => p.user.id !== user?.id)?.user;
      if (!partner) return;
      
      const response = await api.post('/messages', {
        receiverId: partner.id,
        content: newMessage
      });
      setMessages([...messages, response.data.data || response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <main className="flex-1 flex overflow-hidden h-screen layout-main transition-all duration-300">
        <div className="flex-1 flex bg-white overflow-hidden m-4 rounded-[2.5rem] shadow-premium border border-slate-100">
          
          {/* Conversations List */}
          <aside className={`w-full md:w-96 border-r border-slate-50 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-8 border-b border-slate-50">
              <h1 className="text-3xl font-black text-slate-900 mb-8">Messages</h1>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-elite-gold" />
                </div>
              ) : conversations.map((conv) => {
                const partner = conv.partner || conv.participants?.find((p: any) => p.user.id !== user.id)?.user;
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveChat(conv)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer transition-all ${
                      activeChat?.id === conv.id ? 'bg-elite-emerald text-white shadow-lg' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:scale-105 transition-all uppercase">
                      {partner?.nom?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-black text-sm truncate">{partner?.nom} {partner?.prenom}</h4>
                      </div>
                      <p className={`text-xs truncate ${activeChat?.id === conv.id ? 'text-white/70' : 'text-slate-400'}`}>
                        {conv.lastMessage?.content || 'Démarrez une conversion'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Chat Area */}
          <section className={`flex-1 flex flex-col min-w-0 bg-slate-50/30 ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
            {activeChat ? (
              <>
                <header className="p-6 bg-white border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveChat(null)} className="md:hidden p-2 text-slate-400">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 uppercase">
                      {activeChat.partner?.nom?.[0] || activeChat.participants?.find((p: any) => p.user.id !== user.id)?.user.nom?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">
                        {activeChat.partner ? `${activeChat.partner.prenom} ${activeChat.partner.nom}` : 
                         activeChat.participants?.find((p: any) => p.user.id !== user.id)?.user.nom}
                      </h3>
                      <p className="text-[10px] font-black text-elite-emerald uppercase tracking-widest">En ligne</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Phone size={20} /></button>
                    <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Video size={20} /></button>
                    <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-6 rounded-[2rem] shadow-sm ${
                        msg.senderId === user.id 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-50'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${msg.senderId === user.id ? 'text-white/40' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-white border-t border-slate-50">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl">
                    <button type="button" className="p-4 text-slate-400 hover:text-elite-emerald transition-all">
                      <Paperclip size={20} />
                    </button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre message elite..." 
                      className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-sm font-bold text-slate-900"
                    />
                    <button type="submit" className="p-4 bg-elite-emerald text-white rounded-2xl shadow-lg shadow-elite-emerald/20 hover:scale-105 active:scale-95 transition-all">
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-elite-gold/5 text-elite-gold rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Elite Messaging</h3>
                <p className="text-slate-400 font-medium">Sélectionnez une conversation pour démarrer</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Messaging;
