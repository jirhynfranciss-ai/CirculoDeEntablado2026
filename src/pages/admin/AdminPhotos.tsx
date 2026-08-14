import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Upload, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Photo } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeImage from '../../components/ui/SafeImage';
import toast from 'react-hot-toast';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Photo | null>(null);
  const [form, setForm] = useState({ url: '', caption: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const multiRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch { toast.error('Failed to load photos'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ url: '', caption: '', category: '' }); setModalOpen(true); };
  const openEdit = (p: Photo) => {
    setEditItem(p);
    setForm({ url: p.url, caption: p.caption || '', category: p.category || '' });
    setModalOpen(true);
  };

  const handleSingleUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploading(true);
    try {
      const result = await uploadImage(file, 'gallery-photos', 'photos');
      if (result) setForm((f) => ({ ...f, url: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleMultiUpload = async (files: FileList) => {
    setUploading(true);
    const total = files.length;
    let uploaded = 0;
    try {
      for (const file of Array.from(files)) {
        const err = validateImageFile(file);
        if (err) { toast.error(`${file.name}: ${err}`); uploaded++; continue; }
        const result = await uploadImage(file, 'gallery-photos', 'photos');
        if (result) {
          await supabase.from('photos').insert({ url: result.url, caption: null, category: null, updated_at: new Date().toISOString() });
        }
        uploaded++;
        setUploadProgress(Math.round((uploaded / total) * 100));
      }
      toast.success(`${uploaded} photos uploaded!`);
      fetchPhotos();
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const handleSave = async () => {
    if (!form.url) { toast.error('Please upload a photo first'); return; }
    setSaving(true);
    try {
      const payload = {
        url: form.url, caption: form.caption.trim() || null,
        category: form.category.trim() || null, updated_at: new Date().toISOString(),
      };
      if (editItem) {
        const { error } = await supabase.from('photos').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast.success('Photo updated!');
      } else {
        const { error } = await supabase.from('photos').insert(payload);
        if (error) throw error;
        toast.success('Photo added!');
      }
      setModalOpen(false);
      fetchPhotos();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('photos').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Photo deleted');
      setDeleteId(null);
      fetchPhotos();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-500 text-sm">{photos.length} total photos</p>
        </div>
        <div className="flex gap-2">
          <div>
            <input type="file" ref={multiRef} accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleMultiUpload(e.target.files); e.target.value = ''; }} />
            <button onClick={() => multiRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 border border-[#8B0000] text-[#8B0000] rounded-lg text-sm hover:bg-[#FFF5EE] disabled:opacity-60">
              <Upload className="h-4 w-4" /> Bulk Upload
            </button>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm">
            <Plus className="h-4 w-4" /> Add Photo
          </button>
        </div>
      </div>

      {uploading && uploadProgress > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Uploading...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#8B0000] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        photos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No photos yet. Add or bulk upload photos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#F5DEB3]">
                <SafeImage src={p.url} alt={p.caption || 'Photo'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 bg-white/90 rounded text-gray-700 hover:bg-white">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="p-1.5 bg-white/90 rounded text-red-600 hover:bg-white">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {p.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs line-clamp-1">{p.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Photo' : 'Add Photo'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            {form.url && (
              <div className="mb-3 h-40 rounded-lg overflow-hidden bg-[#F5DEB3]">
                <img src={form.url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleSingleUpload(e.target.files[0]); e.target.value = ''; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm w-full justify-center hover:border-[#8B0000] disabled:opacity-60">
              {uploading ? <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading...' : form.url ? 'Replace Photo' : 'Upload Photo'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <input type="text" value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              placeholder="Optional caption"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Rehearsal, Performance, Event"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Photo'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Photo" message="Are you sure you want to delete this photo?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
