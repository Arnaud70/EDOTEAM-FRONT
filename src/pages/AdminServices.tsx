import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, MoreVertical, CheckCircle2, XCircle, Clock, Zap, Pipette, Brush, Flower, Computer, Wind, Loader2, Settings, ShieldCheck, Scissors, Droplet, Hammer, Baby, Camera, Wrench, Book, ChefHat, Truck, Activity, PenTool, Code, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

interface Category {
  id: string;
  nom: string;
  description: string;
  icon: string;
  isActive: boolean;
  status: string;
  _count: {
    providers: number;
  }
}

const AdminServices = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ nom: '', description: '', icon: 'Zap', isActive: true });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/services');
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.patch(`/admin/services/${editingCat.id}`, newCat);
      } else {
        await api.post('/admin/services', newCat);
      }
      setShowAddModal(false);
      setEditingCat(null);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const openEdit = (category: Category) => {
    setEditingCat(category);
    setNewCat({ nom: category.nom, description: category.description || '', icon: category.icon || 'Zap', isActive: category.isActive });
    setShowAddModal(true);
  };

  const toggleService = async (category: Category) => {
    try {
      await api.patch(`/admin/services/${category.id}`, { isActive: !category.isActive });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const deleteService = async (category: Category) => {
    if (!window.confirm(`Supprimer définitivement le service « ${category.nom} » ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/services/${category.id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (!user || user.role?.toUpperCase() !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <PageHeader
          title={<>Catalogue des <span className="gold-accent">Services</span></>}
          subtitle="Gerez les catégories de services disponibles sur EDOTEAM"
          fixed
          actions={(
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-elite-emerald hover:shadow-xl transition-all active:scale-95 group"
            >
              <Plus size={18} className="text-elite-gold group-hover:rotate-90 transition-transform" />
              Nouveau Service
            </button>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin text-elite-gold mx-auto mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chargement du catalogue...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card rounded-[2.5rem]">
              <XCircle className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Aucun service configuré</p>
            </div>
          ) : categories.map((cat, index) => {
            const IconMap: any = { Zap, Pipette, Brush, Flower, Computer, Wind, Settings, ShieldCheck, Scissors, Droplet, Hammer, Baby, Camera, Wrench, Book, ChefHat, Truck, Activity, PenTool, Code };
            const Icon = IconMap[cat.icon] || Zap;
            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] relative group border-none shadow-premium hover:-translate-y-2 transition-all bg-white dark:bg-slate-900"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-elite-emerald/5 text-elite-emerald group-hover:bg-elite-emerald group-hover:text-white">
                    <Icon size={32} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(cat)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors" title="Modifier">
                      <MoreVertical size={20} />
                    </button>
                    <button onClick={() => deleteService(cat)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Supprimer définitivement">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{cat.nom}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed line-clamp-2">
                  {cat.description || "Aucune description fournie pour cette catégorie de service."}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleService(cat)} className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-green-500' : 'bg-slate-400'}`} title="Activer ou désactiver" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{cat.isActive ? 'ACTIF' : 'INACTIF'}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {cat._count?.providers || 0} Préstataires
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Simple Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl"
              >
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">{editingCat ? 'Modifier' : 'Nouveau'} <span className="gold-accent">Service</span></h2>
                <form onSubmit={handleAddCat} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-2">Nom du service</label>
                    <input 
                      required
                      type="text" 
                      value={newCat.nom}
                      onChange={(e) => setNewCat({...newCat, nom: e.target.value})}
                      placeholder="ex: Plomberie" 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-2">Description</label>
                    <textarea 
                      value={newCat.description}
                      onChange={(e) => setNewCat({...newCat, description: e.target.value})}
                      placeholder="Décrivez brièvement le service..." 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 font-bold h-32 resize-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setShowAddModal(false); setEditingCat(null); }}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-elite-emerald transition-all"
                    >
                      {editingCat ? 'Enregistrer les modifications' : 'Créer le service'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminServices;
