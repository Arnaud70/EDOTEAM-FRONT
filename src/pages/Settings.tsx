import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import DefaultAvatar from '../components/DefaultAvatar';
import { User, Mail, Phone, MapPin, Camera, Save, Globe, Bell, Briefcase, FileText, Loader2, CheckCircle2, Trash2, Plus, Image as ImageIcon, AlertCircle, X, Zap, UploadCloud, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { formatTogoPhone, validateName, validatePhone } from '../utils/validation';

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
    genre: '' as '' | 'HOMME' | 'FEMME',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/profile');
      const userData = response.data.data || response.data;
      updateUser(userData);
      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        telephone: formatTogoPhone(userData.telephone || ''),
        localisation: userData.localisation || '',
        titreProfessionnel: userData.titreProfessionnel || '',
        bio: userData.bio || '',
        photoUrl: userData.photoUrl || '',
        genre: userData.genre || '',
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
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans overflow-hidden">
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
    setMessage(null);

    const validationError =
      (formData.nom.trim() && validateName(formData.nom, 'Le nom')) ||
      (formData.prenom.trim() && validateName(formData.prenom, 'Le prénom')) ||
      validatePhone(formData.telephone);
    if (validationError) {
      if (!silent) setMessage({ type: 'error', text: validationError });
      return;
    }

    if (!silent) setIsSaving(true);

    // Filter out empty optional fields to avoid validation errors
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key === 'photoUrl' && value === '') {
        return { ...acc, photoUrl: null, photoPublicId: null };
      }
      if (key === 'genre' && value === '') {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as Record<string, any>);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PROFILE' | 'WORK' | 'DOCUMENT') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'DOCUMENT' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: `Le fichier est trop volumineux (max ${type === 'DOCUMENT' ? 10 : 5} Mo).` });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', type);

    const setBusy = type === 'DOCUMENT' ? setIsUploadingDocument : setIsUploading;

    try {
      setBusy(true);
      setMessage(null);

      const response = await api.post('/upload', uploadData);

      const fileUrl = response.data.data?.url || response.data.url;
      const publicId = response.data.data?.publicId || response.data.publicId;
      const resourceType = response.data.data?.resourceType || response.data.resourceType;

      if (type === 'PROFILE') {
        const updatedFormData = { ...formData, photoUrl: fileUrl };
        setFormData(updatedFormData);
        // Save immediately to persist the change
        const patchResponse = await api.patch('/users/profile', { photoUrl: fileUrl, photoPublicId: publicId });
        const updatedUserData = patchResponse.data.data || patchResponse.data;
        updateUser({ ...user, ...updatedUserData });
        setMessage({ type: 'success', text: 'Photo de profil mise à jour !' });
        setTimeout(() => setMessage(null), 3000);
      } else if (type === 'WORK') {
        await api.post('/users/media', { url: fileUrl, type: 'WORK', publicId, resourceType });
        await fetchProfile();
        setMessage({ type: 'success', text: 'Image ajoutée au portfolio !' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        await api.post('/users/media', { url: fileUrl, type: 'DOCUMENT', publicId, resourceType });
        await fetchProfile();
        setMessage({ type: 'success', text: 'Document envoyé ! Il est en attente de vérification par un administrateur.' });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error: any) {
      console.error('Full Error Object:', error);
      const backendError = error.response?.data?.error?.message || error.response?.data?.message;
      const errMsg = Array.isArray(backendError) ? backendError[0] : backendError || error.message || 'Erreur lors de l\'envoi du fichier.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setBusy(false);
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1220] flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 layout-main min-h-screen p-6 lg:p-12 overflow-y-auto w-full transition-all duration-300">
        <PageHeader
          title={<>Profil & Paramètres</>}
          subtitle="Personnalisez votre expérience EDOTEAM"
          fixed
          actions={(
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
          )}
        />

        {/* Image Lightbox Overlay */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
              onClick={() => setSelectedImage(null)}
            >
              <button 
                className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all shadow-2xl z-[110]"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X size={32} />
              </button>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
              >
                <img 
                  src={selectedImage} 
                  alt="Agrandissement" 
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 space-y-10"
          >
            <section className="glass-card p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-none shadow-premium transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-10 mb-12">
                <div className="relative group mx-auto sm:mx-0">
                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white transition-transform group-hover:scale-105 flex items-center justify-center">
                        {isUploading ? <Loader2 className="animate-spin text-elite-emerald" /> : (
                            <DefaultAvatar photoUrl={formData.photoUrl} genre={formData.genre || null} iconClassName="w-1/2 h-1/2" />
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
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{formData.prenom} {formData.nom}</h3>
                    <p className="text-elite-emerald font-black text-[10px] uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Prénom</label>
                    <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="prenom" required value={formData.prenom} onChange={handleChange} type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Nom</label>
                    <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="nom" required value={formData.nom} onChange={handleChange} type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Email</label>
                    <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input type="email" defaultValue={user.email} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm cursor-not-allowed opacity-60" readOnly />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Téléphone</label>
                    <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="telephone" value={formData.telephone} onChange={(e) => setFormData((previous) => ({ ...previous, telephone: formatTogoPhone(e.target.value) }))} type="tel" inputMode="numeric" maxLength={16} placeholder="+228 90 00 00 00" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Localisation</label>
                    <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                    <input name="localisation" value={formData.localisation} onChange={handleChange} type="text" placeholder="Lomé, Togo" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                    </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Genre (icône de profil par défaut)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, genre: 'HOMME' }))} className={`py-4 rounded-2xl flex items-center justify-center gap-3 border-2 font-bold text-sm transition-all ${formData.genre === 'HOMME' ? 'border-elite-emerald bg-elite-emerald/5 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200'}`}>
                            <User size={18} className={formData.genre === 'HOMME' ? 'text-elite-emerald' : 'opacity-40'} /> Homme
                        </button>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, genre: 'FEMME' }))} className={`py-4 rounded-2xl flex items-center justify-center gap-3 border-2 font-bold text-sm transition-all ${formData.genre === 'FEMME' ? 'border-elite-gold bg-elite-gold/5 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200'}`}>
                            <User size={18} className={formData.genre === 'FEMME' ? 'text-elite-gold' : 'opacity-40'} /> Femme
                        </button>
                    </div>
                </div>

                {user.role === 'PRESTATAIRE' && (
                    <>
                    <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Titre Professionnel</label>
                        <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                        <input name="titreProfessionnel" value={formData.titreProfessionnel} onChange={handleChange} type="text" placeholder="Ex: Expert Électricien" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Ma Biographie</label>
                        <div className="relative group">
                        <FileText className="absolute left-4 top-6 text-slate-300 group-focus-within:text-elite-emerald transition-all" size={18} />
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Parlez de votre expertise et de votre approche..." className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl outline-none focus:ring-2 focus:ring-elite-emerald/10 transition-all font-bold text-sm resize-none" />
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
                    className="glass-card p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-none shadow-premium"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Portfolio & Réalisations</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Gérez vos meilleures photos de travaux</p>
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
                            <div 
                              key={media.id} 
                              className="relative group aspect-square rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                              onClick={() => setSelectedImage(media.url)}
                            >
                                <img src={media.url} alt="Portfolio" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMedia(media.id);
                                      }} 
                                      className="p-3 bg-red-500 text-white rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all">
                                        <Zap size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!user.media || user.media.filter(m => m.type === 'WORK').length === 0) && (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                                <ImageIcon className="mx-auto text-slate-100 mb-4" size={48} />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Votre portfolio est vide</p>
                            </div>
                        )}
                    </div>
                </motion.section>
            )}
          </motion.div>

          <div className="space-y-10">
            {user.role === 'PRESTATAIRE' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-none shadow-premium"
              >
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Vérification du compte</h3>

                {user.verificationStatus === 'VERIFIED' && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm mb-6">
                    <ShieldCheck size={20} className="shrink-0" />
                    Votre compte est validé. Vos services sont visibles publiquement.
                  </div>
                )}
                {user.verificationStatus === 'REJECTED' && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm mb-6 space-y-1">
                    <div className="flex items-center gap-3"><ShieldAlert size={20} className="shrink-0" /> Document non validé</div>
                    {user.rejectionReason && <p className="text-xs font-semibold text-red-600 pl-8">{user.rejectionReason}</p>}
                  </div>
                )}
                {user.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm mb-6">
                    <ShieldQuestion size={20} className="shrink-0" />
                    En attente de vérification par un administrateur.
                  </div>
                )}

                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                  Importez une attestation de service, carte professionnelle ou tout document prouvant votre qualification.
                </p>

                <button
                  type="button"
                  onClick={() => documentInputRef.current?.click()}
                  disabled={isUploadingDocument}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-elite-emerald transition-all disabled:opacity-50"
                >
                  {isUploadingDocument ? <Loader2 size={22} className="animate-spin text-elite-emerald shrink-0" /> : <UploadCloud size={22} className="text-elite-emerald shrink-0" />}
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {user.media?.some(m => m.type === 'DOCUMENT')
                      ? 'Remplacer mon document justificatif'
                      : 'Importer mon document justificatif'}
                  </span>
                </button>
                <input
                  type="file"
                  ref={documentInputRef}
                  onChange={(e) => handleFileUpload(e, 'DOCUMENT')}
                  className="hidden"
                  accept="image/png,image/jpeg,image/gif,application/pdf"
                />
              </motion.div>
            )}

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass-card p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-none shadow-premium"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Préférences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500"><Bell size={20} /></div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Notifications</span>
                  </div>
                  <div className="w-10 h-5 bg-elite-emerald rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white dark:bg-slate-900 rounded-full" /></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500"><Globe size={20} /></div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Langue: Français</span>
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
