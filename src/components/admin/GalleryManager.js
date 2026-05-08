'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Camera,
  Tag,
  Type
} from 'lucide-react';
import { getGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage } from '@/actions/gallery';
import { uploadImage } from '@/actions/upload';
import Image from 'next/image';

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    src: '',
    public_id: ''
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const data = await getGalleryImages();
    setImages(data);
    setLoading(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const result = await uploadImage(formDataUpload);
    setUploading(false);

    if (result.success) {
      setFormData({
        ...formData,
        src: result.url,
        public_id: result.public_id
      });
      showToast('Image Decrypted Successfully', 'success');
    } else {
      showToast('Neural Upload Failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.src) return showToast('No Image Data Detected', 'error');

    setUploading(true);
    let res;
    if (editingImage) {
      res = await updateGalleryImage(editingImage._id, formData);
    } else {
      res = await addGalleryImage(formData);
    }
    setUploading(false);

    if (res.success) {
      showToast(editingImage ? 'Archive Updated' : 'New Image Cataloged', 'success');
      setIsModalOpen(false);
      setEditingImage(null);
      setFormData({ title: '', category: '', src: '', public_id: '' });
      fetchImages();
    } else {
      showToast('Operation Failed', 'error');
    }
  };

  const handleDelete = async (id, public_id) => {
    if (!confirm('Erase this visual chronicle from existence?')) return;
    
    const res = await deleteGalleryImage(id, public_id);
    if (res.success) {
      showToast('Chronicle Erased', 'success');
      fetchImages();
    } else {
      showToast('Erasure Failed', 'error');
    }
  };

  const openModal = (img = null) => {
    if (img) {
      setEditingImage(img);
      setFormData({
        title: img.title,
        category: img.category,
        src: img.src,
        public_id: img.public_id
      });
    } else {
      setEditingImage(null);
      setFormData({ title: '', category: '', src: '', public_id: '' });
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Accessing Visual Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-12 left-1/2 z-[1000000] px-8 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest italic">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h4 className="text-xl font-black italic uppercase tracking-tight text-white/80">Visual Repository</h4>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Manage your visual chronicles and setup gallery</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={16} />
          Catalog New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map((img) => (
          <motion.div 
            key={img._id}
            layout
            className="group relative glass-premium rounded-[2.5rem] border border-white/5 bg-[#0a0f1a]/40 overflow-hidden hover:border-primary/20 transition-all duration-500"
          >
            <div className="relative aspect-[4/5]">
              <Image 
                src={img.src} 
                alt={img.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => openModal(img)}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:text-primary transition-all"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(img._id, img.public_id)}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary italic mb-1 block">{img.category}</span>
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">{img.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-2xl glass-premium border border-white/10 rounded-[3rem] p-10 bg-[#0a0f1a] overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    {editingImage ? 'Modify Archive' : 'Catalog Entry'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
                    Neural Imaging Interface
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Type size={16} />
                        <label className="text-[10px] font-black uppercase tracking-widest italic">Visual Title</label>
                      </div>
                      <input 
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-primary transition-all italic"
                        placeholder="e.g. Midnight Session"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Tag size={16} />
                        <label className="text-[10px] font-black uppercase tracking-widest italic">Classification</label>
                      </div>
                      <input 
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-primary transition-all italic"
                        placeholder="e.g. Setup, Code, Work"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Camera size={16} />
                      <label className="text-[10px] font-black uppercase tracking-widest italic">Neural Scan</label>
                    </div>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative h-64 rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all overflow-hidden group"
                    >
                      {formData.src ? (
                        <>
                          <Image src={formData.src} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="relative z-10 flex flex-col items-center gap-2">
                            <Upload className="text-white" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Replace Scan</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Upload Visual Data</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic mt-1">Supports PNG, JPG, WEBP</p>
                          </div>
                        </>
                      )}
                      
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={uploading || !formData.src}
                    className="w-full py-6 bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] italic rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {editingImage ? 'Execute Update' : 'Seal Chronicle'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
