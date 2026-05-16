import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Trash2, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      
      const notifsData = notifsRes.data?.data ?? notifsRes.data ?? [];
      const countData = countRes.data?.data ?? countRes.data ?? 0;
      
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
      setUnreadCount(typeof countData === 'number' ? countData : 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Periodically poll for notifications disabled for stability
      // const interval = setInterval(fetchNotifications, 60000);
      // return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-slate-50 text-slate-400 hover:text-elite-emerald hover:bg-elite-emerald/5 rounded-2xl transition-all shadow-sm"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-[60]" />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-premium border border-slate-50 z-[70] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Notifications</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unreadCount} nouveaux messages</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="p-3 text-elite-emerald hover:bg-elite-emerald/5 rounded-xl transition-all"
                    title="Tout marquer comme lu"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {(!Array.isArray(notifications) || notifications.length === 0) ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Bell size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-6 transition-all hover:bg-slate-50/50 cursor-pointer relative group ${!notif.isRead ? 'bg-elite-emerald/[0.02]' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            !notif.isRead ? 'bg-elite-emerald text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Info size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-900 mb-1">{notif.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                              <Clock size={10} />
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <div className="absolute top-6 right-6 w-2 h-2 bg-elite-emerald rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/50 text-center">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-elite-emerald transition-all">
                  Voir tout l'historique
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
