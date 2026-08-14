import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Video as VideoType } from '../../types';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', video_url: '', thumbnail: '',
  year: new Date().getFullYear(), category: '',
};

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VideoType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch { toast.error('Failed to load videos'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (v: VideoType) => {
    setEditItem(v);
    setForm({
      title: v.title, description: v.description || '', video_url: v.video_url,
      thumbnail: v.thumbnail || '', year: v.year || new Date().getFullYear(), category: v.category || '',
    });
    setModalOpen(true);
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.video_url.trim()) { toast.error('Video URL is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim() || null,
        video_url: form.video_url.trim(), thumbnail: form.thumbnail.trim() || null,
        year: form.year || null, category: form.category.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (editItem) {
        const { error } = await supabase.from('videos').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast.success('Video updated!');
      } else {
        const { error } = await supabase.from('videos').insert(payload);
        if (error) throw error;
        toast.success('Video added!');
      }
      setModalOpen(false);
      fetchVideos();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Video deleted');
      setDeleteId(null);
      fetchVideos();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Videos</h1>
          <p className="text-gray-500 text-sm">{videos.length} total videos</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm">
          <Plus className="h-4 w-4" /> Add Video
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 py-16 text-center">
              <Video className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No videos yet.</p>
            </div>
          ) : (
            videos.map((v) => {
              const ytId = getYoutubeId(v.video_url);
              return (
                <div key={v.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-video bg-[#2C1810]">
                    {ytId ? (
                      <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-[#D2B48C]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-[#8B0000]/80 rounded-full p-2">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{v.title}</h3>
                    {v.category && <p className="text-xs text-gray-500 mt-0.5">{v.category}</p>}
                    {v.year && <p className="text-xs text-gray-400">{v.year}</p>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(v.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Video' : 'Add Video'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL * (YouTube or direct URL)</label>
            <input type="url" value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Performance, Behind the Scenes"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Video'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Video" message="Are you sure you want to delete this video?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
