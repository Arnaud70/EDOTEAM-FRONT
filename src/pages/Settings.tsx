import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, MapPin, Camera, Save, Globe, Bell, Briefcase, FileText, Loader2, CheckCircle2, Trash2, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    localisation: '',
    titreProfessionnel: '',
    bio: '',
    photoUrl: '',
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/profile');
      const userData = response.data.data || response.data;
      updateUser(userData);
      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        telephone: userData.telephone || '',
        localisation: userData.localisation || '',
        titreProfessionnel: userData.titreProfessionnel || '',
        bio: userData.bio || '',
        photoUrl: userData.photoUrl || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 layout-main min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-elite-gold" size={48} />
        </main>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent, silent = false) => {
    if (e) e.preventDefault();
    if (!silent) setIsSaving(true);
    setMessage(null);

    // Filter out empty optional fields to avoid validation errors
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key === 'photoUrl' && value === '') return acc;
      return { ...acc, [key]: value };
    }, {});

    try {
      const response = await api.patch('/users/profile', cleanedData);
      const updatedData = response.data.data || response.data;
      updateUser({ ...user, ...updatedData });
      if (!silent) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (!silent) {
        const backendError = error.response?.data?.error?.message || error.response?.data?.message;
        const errMsg = Array.isArray(backendError) ? backendError[0] : backendError || error.message || 'Une erreur est survenue lors de la mise à jour.';
        setMessage({ type: 'error', text: errMsg });
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PROFILE' | 'WORK') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Le fichier est trop volumineux (max 5 Mo).' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploading(true);
      setMessage(null);
      
      const response = await api.post('/upload', uploadData);
      
      const fileUrl = response.data.data?.url || response.data.url;

      if (type === 'PROFILE') {
        const updatedFormData = { ...formData, photoUrl: fileUrl };
        setFormData(updatedFormData);
        // Save immediately to persist the change
        const patchResponse = await api.patch('/users/profile', { photoUrl: fileUrl });
        const updatedUserData = patchResponse.data.data || patchResponse.data;
        updateUser({ ...user, ...updatedUserData });
        setMessage({ type: 'success', text: 'Photo de profil mise à jour !' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        await api.post('/users/media', { url: fileUrl, type: 'WORK' });
        await fetchProfile();
        setMessage({ type: 'success', text: 'Image ajoutée au portfolio !' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Full Error Object:', error);
      const backendError = error.response?.data?.error?.message || error.response?.data?.message;
      const errMsg = Array.isArray(backendError) ? backendError[0] : backendError || error.message || 'Erreur lors de l\'envoi du fichier.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  const handleAddPortfolioMedia = async () => {
    if (!newMediaUrl) return;
    try {
      setIsSaving(true);
      await api.post('/users/media', { url: newMediaUrl, type: 'WORK' });
      setNewMediaUrl('');
      await fetchProfile();
      setMessage({ type: 'success', text: 'Image ajoutée au portfolio !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding media:', error);
      setMessage({ type: 'error', text: 'Impossible d\'ajouter l\'image.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm('Voulez-vous supprimer cette image ?')) return;
    try {
      setIsSaving(true);
      await api.delete(`/users/media/${mediaId}`);
      await fetchProfile();
      setMessage({ type: 'success', text: 'Média supprimé avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting media:', error);
      setMessage({ type: 'error', text: 'Impossible de supprimer le média.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">
              Profil & Paramètres
            </h1>
            <p className="text-slate-500 font-medium">Personnalisez votre expérience EDOTEAM</p>
          </motion.div>

          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] shadow-sm uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
              >
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 space-y-10"
          >
            <section className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-10 mb-12">
                <div className="relative group mx-auto sm:mx-0">
                    <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center font-black text-slate-300 text-3xl overflow-hidden shadow-inner uppercase border-4 border-white transition-transform group-hover:scale-105">
                        {isUploading ? <Loader2 className="animate-spin text-elite-emerald" /> : (
                            formData.photoUrl ? <img src={formData.photoUrl} alt="Profil" className="w-full h-full object-cover" /> : user.nom[0]
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-3 bg-slate-900 text-white rounded-2xl border-4 border-white hover:bg-elite-emerald transition-all shadow-xl group-active:scale-90"
                    >
                        <Camera size={20} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => handleFileUpload(e, 'PROFILE')} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                    />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{formData.prenom} {formData.nom}</h3>
                    <p className="text-elite-emerald font-black text-[10px] uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Prénom</label>
                    <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="prenom" required value={formData.prenom} onChange={handleChange} type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nom</label>
                    <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="nom" required value={formData.nom} onChange={handleChange} type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                    <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input type="email" defaultValue={user.email} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm cursor-not-allowed opacity-60" readOnly />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Téléphone</label>
                    <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="telephone" value={formData.telephone} onChange={handleChange} type="tel" placeholder="+228 90 00 00 00" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Localisation</label>
                    <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="localisation" value={formData.localisation} onChange={handleChange} type="text" placeholder="Lomé, Togo" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>

                {user.role === 'PRESTATAIRE' && (
                    <>
                    <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Titre Professionnel</label>
                        <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                        <input name="titreProfessionnel" value={formData.titreProfessionnel} onChange={handleChange} type="text" placeholder="Ex: Expert Électricien" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ma Biographie</label>
                        <div className="relative group">
                        <FileText className="absolute left-4 top-6 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Parlez de votre expertise et de votre approche..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm resize-none" />
                        </div>
                    </div>
                    </>
                )}

                <div className="md:col-span-2 flex justify-end pt-6">
                    <button disabled={isSaving} type="submit" className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-elite-emerald shadow-xl transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="text-elite-gold group-hover:rotate-12 transition-transform" />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
                </form>
            </section>

            {user.role === 'PRESTATAIRE' && (
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Portfolio & Réalisations</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Gérez vos meilleures photos de travaux</p>
                        </div>
                        <button 
                            onClick={() => portfolioInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-4 bg-elite-gold/10 text-elite-emerald rounded-2xl hover:bg-elite-gold hover:text-elite-emerald transition-all disabled:opacity-50"
                        >
                           {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                        </button>
                        <input 
                            type="file" 
                            ref={portfolioInputRef} 
                            onChange={(e) => handleFileUpload(e, 'WORK')} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {user.media?.filter(m => m.type === 'WORK').map((media) => (
                            <div key={media.id} className="relative group aspect-square rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                                <img src={media.url} alt="Portfolio" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeleteMedia(media.id)} className="p-3 bg-red-500 text-white rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!user.media || user.media.filter(m => m.type === 'WORK').length === 0) && (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                <ImageIcon className="mx-auto text-slate-100 mb-4" size={48} />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Votre portfolio est vide</p>
                            </div>
                        )}
                    </div>
                </motion.section>
            )}
          </motion.div>

          <div className="space-y-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass-card p-10 rounded-[3rem] bg-white border-none shadow-premium"
            >
              <h3 className="text-xl font-black text-slate-900 mb-8">Préférences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Bell size={20} /></div>
                    <span className="text-xs font-black text-slate-900 uppercase">Notifications</span>
                  </div>
                  <div className="w-10 h-5 bg-elite-emerald rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Globe size={20} /></div>
                    <span className="text-xs font-black text-slate-900 uppercase">Langue: Français</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
