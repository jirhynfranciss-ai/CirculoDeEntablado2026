import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ContactMessage } from '../../types';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
    } catch { toast.error('Failed to mark as read'); }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMsg(msg);
    if (!msg.is_read) await markAsRead(msg.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Message deleted');
      setDeleteId(null);
      if (selectedMsg?.id === deleteId) setSelectedMsg(null);
      fetchMessages();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = messages.filter((m) => {
    if (filterRead === 'unread') return !m.is_read;
    if (filterRead === 'read') return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 text-sm">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button key={f} onClick={() => setFilterRead(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filterRead === f ? 'bg-[#8B0000] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8B0000]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No messages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !msg.is_read ? 'bg-[#FFF5EE]' : ''
                  }`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!msg.is_read ? 'bg-[#8B0000]' : 'bg-transparent'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-medium text-sm ${!msg.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {msg.name}
                        </span>
                        <span className="text-gray-400 text-xs">{msg.email}</span>
                      </div>
                      <p className={`text-sm truncate ${!msg.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(msg.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedMsg && (
        <Modal isOpen={!!selectedMsg} onClose={() => setSelectedMsg(null)} title="Message Details" size="md">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{selectedMsg.name}</span>
                {selectedMsg.is_read && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Read</span>}
              </div>
              <p className="text-sm text-gray-500">{selectedMsg.email}</p>
              <p className="text-xs text-gray-400">{new Date(selectedMsg.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject</p>
              <p className="font-medium text-gray-900">{selectedMsg.subject}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Message</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
            </div>
            <div className="flex gap-3">
              <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded text-sm hover:bg-[#6d0000]">
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
              <button onClick={() => { setDeleteId(selectedMsg.id); setSelectedMsg(null); }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Delete Message" message="Are you sure you want to permanently delete this message?"
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
