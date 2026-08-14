import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PressReview } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', publication: '', author: '', date: '',
  description: '', article_url: '', featured_image: '',
};

export default function AdminPressReviews() {
  const [reviews, setReviews] = useState<PressReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PressReview | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('press_reviews').select('*').order('date', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch { toast.error('Failed to load press reviews'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (r: PressReview) => {
    setEditItem(r);
    setForm({
      title: r.title, publication: r.publication, author: r.author || '',
      date: r.date || '', description: r.description || '',
      article_url: r.article_url || '', featured_image: r.featured_image || '',
    });
    setModalOpen(true);
  };

  const handleImgUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploading(true);
    try {
      const result = await uploadImage(file, 'press-images', 'press');
      if (result) setForm((f) => ({ ...f, featured_image: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.publication.trim()) { toast.error('Publication is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(), publication: form.publication.trim(),
        author: form.author.trim() || null, date: form.date || null,
        description: form.description.trim() || null,
        article_url: form.article_url.trim() || null,
        featured_image: form.featured_image || null,
        updated_at: new Date().toISOString(),
      };
      if (editItem) {
        const { error } = await supabase.from('press_reviews').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast.success('Review updated!');
      } else {
        const { error } = await supabase.from('press_reviews').insert(payload);
        if (error) throw error;
        toast.success('Review added!');
      }
      setModalOpen(false);
      fetchReviews();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('press_reviews').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Review deleted');
      setDeleteId(null);
      fetchReviews();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Press Reviews</h1>
          <p className="text-gray-500 text-sm">{reviews.length} total reviews</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm">
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No press reviews yet.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{r.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[#8B0000] text-sm">{r.publication}</span>
                      {r.author && <span className="text-gray-500 text-xs">by {r.author}</span>}
                      {r.date && <span className="text-gray-400 text-xs">{new Date(r.date).toLocaleDateString()}</span>}
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>}
                    {r.article_url && (
                      <a href={r.article_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#8B0000] mt-1 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Read Article
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Review' : 'Add Press Review'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review/Article Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication *</label>
              <input type="text" value={form.publication} onChange={(e) => setForm((f) => ({ ...f, publication: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article URL</label>
              <input type="url" value={form.article_url} onChange={(e) => setForm((f) => ({ ...f, article_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Excerpt</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            {form.featured_image && (
              <div className="mb-2 h-28 rounded-lg overflow-hidden bg-[#F5DEB3]">
                <img src={form.featured_image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleImgUpload(e.target.files[0]); e.target.value = ''; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm w-full justify-center hover:border-[#8B0000] disabled:opacity-60">
              {uploading ? <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Image
            </button>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Review'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Review" message="Are you sure you want to delete this press review?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
