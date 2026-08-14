import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Member } from '../../types';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeImage from '../../components/ui/SafeImage';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  full_name: '', role: '', year: new Date().getFullYear(), biography: '',
  status: 'active' as 'active' | 'inactive', date_joined: '', profile_picture: '' as string,
};

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('members').select('*').order('full_name');
      if (error) throw error;
      setMembers(data || []);
      const uniqueYears = [...new Set((data || []).map((m: Member) => m.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditMember(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (m: Member) => {
    setEditMember(m);
    setForm({
      full_name: m.full_name, role: m.role, year: m.year,
      biography: m.biography || '', status: m.status,
      date_joined: m.date_joined || '', profile_picture: m.profile_picture || '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploadingImg(true);
    try {
      const result = await uploadImage(file, 'member-profiles', 'profiles');
      if (result) setForm((f) => ({ ...f, profile_picture: result.url }));
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Upload failed');
    } finally { setUploadingImg(false); }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }
    if (!form.role.trim()) { toast.error('Role is required'); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(), role: form.role.trim(),
        year: form.year, biography: form.biography.trim() || null,
        status: form.status, date_joined: form.date_joined || null,
        profile_picture: form.profile_picture || null,
        updated_at: new Date().toISOString(),
      };
      if (editMember) {
        const { error } = await supabase.from('members').update(payload).eq('id', editMember.id);
        if (error) throw error;
        toast.success('Member updated!');
      } else {
        const { error } = await supabase.from('members').insert(payload);
        if (error) throw error;
        toast.success('Member added!');
      }
      setModalOpen(false);
      fetchMembers();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Member deleted');
      setDeleteId(null);
      fetchMembers();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = members.filter((m) => {
    const s = search.toLowerCase();
    const match = !s || m.full_name.toLowerCase().includes(s) || m.role.toLowerCase().includes(s);
    const yearMatch = filterYear === 'all' || m.year === filterYear;
    const statusMatch = filterStatus === 'all' || m.status === filterStatus;
    return match && yearMatch && statusMatch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm">{members.length} total members</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] transition-colors text-sm">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search members..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B0000]" />
        </div>
        <select value={filterYear === 'all' ? 'all' : String(filterYear)}
          onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] bg-white">
          <option value="all">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Member</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Year</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#F5DEB3] flex-shrink-0">
                            <SafeImage src={m.profile_picture} alt={m.full_name} className="h-full w-full object-cover"
                              fallback={<div className="h-full w-full flex items-center justify-center bg-[#D2B48C]/30"><Users className="h-4 w-4 text-[#8B0000]" /></div>} />
                          </div>
                          <span className="font-medium text-gray-900">{m.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.role}</td>
                      <td className="px-4 py-3 text-gray-600">{m.year}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(m)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMember ? 'Edit Member' : 'Add Member'} size="lg">
        <div className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#F5DEB3] flex-shrink-0">
              {form.profile_picture ? (
                <img src={form.profile_picture} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><Users className="h-8 w-8 text-[#D2B48C]" /></div>
              )}
            </div>
            <div>
              <input type="file" ref={fileRef} accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); e.target.value = ''; }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60">
                {uploadingImg ? <div className="h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploadingImg ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/WebP</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <input type="text" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
              <input type="date" value={form.date_joined} onChange={(e) => setForm((f) => ({ ...f, date_joined: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea value={form.biography} onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000] disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editMember ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId} title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmLabel="Delete" danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
