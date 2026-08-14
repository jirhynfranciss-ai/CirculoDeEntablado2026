import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, Film } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Production } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeImage from '../../components/ui/SafeImage';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '', venue: '', director: '',
  ticket_info: '', status: 'coming_soon' as Production['status'], category: '',
  year: new Date().getFullYear(), poster: '', images: [] as string[],
};

const STATUS_LABELS: Record<string, string> = {
  current: 'Current Season',
  coming_soon: 'Coming Soon',
  past: 'Past Performance',
};

export default function AdminProductions() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Production | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);
  const imgsRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProductions(); }, []);

  const fetchProductions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('productions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProductions(data || []);
    } catch { toast.error('Failed to load productions'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p: Production) => {
    setEditItem(p);
    setForm({
      title: p.title, description: p.description || '', date: p.date || '', time: p.time || '',
      venue: p.venue || '', director: p.director || '', ticket_info: p.ticket_info || '',
      status: p.status, category: p.category || '', year: p.year, poster: p.poster || '', images: p.images || [],
    });
    setModalOpen(true);
  };

  const handlePosterUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploadingPoster(true);
    try {
      const result = await uploadImage(file, 'production-posters', 'posters');
      if (result) setForm((f) => ({ ...f, poster: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingPoster(false); }
  };

  const handleImgsUpload = async (files: FileList) => {
    setUploadingImgs(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const err = validateImageFile(file);
        if (err) { toast.error(err); continue; }
        const result = await uploadImage(file, 'production-images', 'images');
        if (result) newUrls.push(result.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingImgs(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim() || null,
        date: form.date || null, time: form.time || null, venue: form.venue.trim() || null,
        director: form.director.trim() || null, ticket_info: form.ticket_info.trim() || null,
        status: form.status, category: form.category.trim() || null,
        year: form.year, poster: form.poster || null, images: form.images,
        updated_at: new Date().toISOString(),
      };
      if (editItem) {
        const { error } = await supabase.from('productions').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast.success('Production updated!');
      } else {
        const { error } = await supabase.from('productions').insert(payload);
        if (error) throw error;
        toast.success('Production added!');
      }
      setModalOpen(false);
      fetchProductions();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('productions').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Production deleted');
      setDeleteId(null);
      fetchProductions();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = filterStatus === 'all' ? productions : productions.filter((p) => p.status === filterStatus);

  const statusColor: Record<string, string> = {
    current: 'bg-green-100 text-green-700',
    coming_soon: 'bg-amber-100 text-amber-700',
    past: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Productions</h1>
          <p className="text-gray-500 text-sm">{productions.length} total productions</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm">
          <Plus className="h-4 w-4" /> Add Production
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', 'current', 'coming_soon', 'past'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterStatus === s ? 'bg-[#8B0000] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8B0000]'
            }`}>
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Film className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No productions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Production</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Venue</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 rounded overflow-hidden bg-[#F5DEB3] flex-shrink-0">
                            <SafeImage src={p.poster} alt={p.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.title}</p>
                            {p.director && <p className="text-xs text-gray-500">Dir. {p.director}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.venue || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Production' : 'Add Production'} size="xl">
        <div className="space-y-4">
          {/* Poster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Poster</label>
            <div className="flex items-start gap-4">
              <div className="h-24 w-16 rounded-lg overflow-hidden bg-[#F5DEB3] flex-shrink-0">
                {form.poster ? (
                  <img src={form.poster} alt="Poster" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><Film className="h-6 w-6 text-[#D2B48C]" /></div>
                )}
              </div>
              <div>
                <input type="file" ref={posterRef} accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handlePosterUpload(e.target.files[0]); e.target.value = ''; }} />
                <button onClick={() => posterRef.current?.click()} disabled={uploadingPoster}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60">
                  {uploadingPoster ? <div className="h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload Poster
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Production['status'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] bg-white">
                <option value="current">Current Season</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="past">Past Performance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category / Genre</label>
              <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Drama, Comedy, Musical"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
              <input type="text" value={form.director} onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Information</label>
              <input type="text" value={form.ticket_info} onChange={(e) => setForm((f) => ({ ...f, ticket_info: e.target.value }))}
                placeholder="e.g. ₱200 per ticket, contact us to reserve"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Production Images</label>
            <input type="file" ref={imgsRef} accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleImgsUpload(e.target.files); e.target.value = ''; }} />
            <button onClick={() => imgsRef.current?.click()} disabled={uploadingImgs}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#8B0000] w-full justify-center disabled:opacity-60">
              {uploadingImgs ? <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Images
            </button>
            {form.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded overflow-hidden bg-[#F5DEB3]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
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
              {editItem ? 'Save Changes' : 'Add Production'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Production" message="Are you sure? This will also affect related cast and team records."
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
