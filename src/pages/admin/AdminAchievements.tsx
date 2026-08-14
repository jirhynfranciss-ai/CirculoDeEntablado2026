import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Achievement } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeImage from '../../components/ui/SafeImage';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', year: new Date().getFullYear(),
  date: '', award: '', organization: '', images: [] as string[],
};

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Achievement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAchievements(); }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('achievements').select('*').order('year', { ascending: false });
      if (error) throw error;
      setAchievements(data || []);
    } catch { toast.error('Failed to load achievements'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a: Achievement) => {
    setEditItem(a);
    setForm({ title: a.title, description: a.description || '', year: a.year, date: a.date || '', award: a.award || '', organization: a.organization || '', images: a.images || [] });
    setModalOpen(true);
  };

  const handleImgUpload = async (files: FileList) => {
    setUploadingImgs(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const err = validateImageFile(file);
        if (err) { toast.error(err); continue; }
        const result = await uploadImage(file, 'achievement-images', 'images');
        if (result) newUrls.push(result.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingImgs(false); }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim() || null,
        year: form.year, date: form.date || null, award: form.award.trim() || null,
        organization: form.organization.trim() || null, images: form.images,
        updated_at: new Date().toISOString(),
      };
      if (editItem) {
        const { error } = await supabase.from('achievements').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast.success('Achievement updated!');
      } else {
        const { error } = await supabase.from('achievements').insert(payload);
        if (error) throw error;
        toast.success('Achievement added!');
      }
      setModalOpen(false);
      fetchAchievements();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Achievement deleted');
      setDeleteId(null);
      fetchAchievements();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Achievements</h1>
          <p className="text-gray-500 text-sm">{achievements.length} total achievements</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm">
          <Plus className="h-4 w-4" /> Add Achievement
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="space-y-3">
          {achievements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <Award className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No achievements yet.</p>
            </div>
          ) : (
            achievements.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-[#8B0000] flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 truncate">{a.title}</h3>
                      <span className="text-xs text-[#8B0000] bg-[#FFF5EE] px-2 py-0.5 rounded flex-shrink-0">{a.year}</span>
                    </div>
                    {a.organization && <p className="text-sm text-gray-500">{a.organization}</p>}
                    {a.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>}
                    {a.images.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {a.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="h-10 w-10 rounded overflow-hidden bg-[#F5DEB3]">
                            <SafeImage src={img} alt={`img-${i}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Achievement' : 'Add Achievement'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award / Category</label>
              <input type="text" value={form.award} onChange={(e) => setForm((f) => ({ ...f, award: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Event</label>
              <input type="text" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <input type="file" ref={fileRef} accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleImgUpload(e.target.files); e.target.value = ''; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploadingImgs}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#8B0000] hover:text-[#8B0000] w-full justify-center disabled:opacity-60">
              {uploadingImgs ? <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingImgs ? 'Uploading...' : 'Upload Images'}
            </button>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded overflow-hidden bg-[#F5DEB3]">
                    <SafeImage src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Achievement'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Achievement" message="Are you sure you want to delete this achievement?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
