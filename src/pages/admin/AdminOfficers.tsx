import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Upload, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Officer } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeImage from '../../components/ui/SafeImage';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  full_name: '', position: '', year: new Date().getFullYear(),
  biography: '', term: '', profile_picture: '',
};

export default function AdminOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState<Officer | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => { fetchOfficers(); }, []);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('officers').select('*').order('year', { ascending: false });
      if (error) throw error;
      setOfficers(data || []);
      const uniqueYears = [...new Set((data || []).map((o: Officer) => o.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch { toast.error('Failed to load officers'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditOfficer(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (o: Officer) => {
    setEditOfficer(o);
    setForm({ full_name: o.full_name, position: o.position, year: o.year, biography: o.biography || '', term: o.term || '', profile_picture: o.profile_picture || '' });
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploadingImg(true);
    try {
      const result = await uploadImage(file, 'officer-profiles', 'profiles');
      if (result) setForm((f) => ({ ...f, profile_picture: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingImg(false); }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }
    if (!form.position.trim()) { toast.error('Position is required'); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(), position: form.position.trim(),
        year: form.year, biography: form.biography.trim() || null,
        term: form.term.trim() || null, profile_picture: form.profile_picture || null,
        updated_at: new Date().toISOString(),
      };
      if (editOfficer) {
        const { error } = await supabase.from('officers').update(payload).eq('id', editOfficer.id);
        if (error) throw error;
        toast.success('Officer updated!');
      } else {
        const { error } = await supabase.from('officers').insert(payload);
        if (error) throw error;
        toast.success('Officer added!');
      }
      setModalOpen(false);
      fetchOfficers();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('officers').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Officer deleted');
      setDeleteId(null);
      fetchOfficers();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = officers.filter((o) => {
    const s = search.toLowerCase();
    const match = !s || o.full_name.toLowerCase().includes(s) || o.position.toLowerCase().includes(s);
    const yearMatch = filterYear === 'all' || o.year === filterYear;
    return match && yearMatch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Officers</h1>
          <p className="text-gray-500 text-sm">{officers.length} total officers</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] transition-colors text-sm">
          <Plus className="h-4 w-4" /> Add Officer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search officers..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B0000]" />
        </div>
        <select value={filterYear === 'all' ? 'all' : String(filterYear)}
          onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] bg-white">
          <option value="all">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UserCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No officers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Officer</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Position</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Year/Term</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#F5DEB3] flex-shrink-0">
                            <SafeImage src={o.profile_picture} alt={o.full_name} className="h-full w-full object-cover"
                              fallback={<div className="h-full w-full flex items-center justify-center bg-[#D2B48C]/30"><UserCheck className="h-4 w-4 text-[#8B0000]" /></div>} />
                          </div>
                          <span className="font-medium text-gray-900">{o.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.position}</td>
                      <td className="px-4 py-3 text-gray-600">{o.term || o.year}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(o)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(o.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editOfficer ? 'Edit Officer' : 'Add Officer'} size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#F5DEB3] flex-shrink-0">
              {form.profile_picture ? (
                <img src={form.profile_picture} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><UserCheck className="h-8 w-8 text-[#D2B48C]" /></div>
              )}
            </div>
            <div>
              <input type="file" ref={fileRef} accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); e.target.value = ''; }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60">
                {uploadingImg ? <div className="h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload Photo
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input type="text" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term / Academic Year</label>
              <input type="text" value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                placeholder="e.g. 2024-2025"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea value={form.biography} onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editOfficer ? 'Save Changes' : 'Add Officer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Officer" message="Are you sure you want to delete this officer?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
