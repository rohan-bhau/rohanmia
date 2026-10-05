'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  CalendarCheck, 
  Trash2, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Loader2, 
  ArrowUpRight,
  MessageSquare,
  Video,
  X
} from 'lucide-react';
import { fetchAdminContactData, updateMessageStatus, removeContactMessage, cancelBookingAdmin } from '@/actions/adminContact';
import { DbContactMessageRow, DbMeetingBookingRow } from '@/lib/db/contact';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function AdminContactPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<DbContactMessageRow[]>([]);
  const [bookings, setBookings] = useState<DbMeetingBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'bookings'>('messages');

  // Deletion modal
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAdminContactData();
    if (res.success) {
      setMessages(res.messages || []);
      setBookings(res.bookings || []);
    } else {
      showToast(res.error || 'Failed to load contact records', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatus = async (id: string, status: 'read' | 'unread' | 'replied') => {
    startTransition(async () => {
      const res = await updateMessageStatus(id, status);
      if (res.success) {
        showToast(`Message marked as ${status}.`, 'success');
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      } else {
        showToast(res.error || 'Failed to update status', 'error');
      }
    });
  };

  const confirmDeleteMsg = async () => {
    if (!deletingMsgId) return;
    startTransition(async () => {
      const res = await removeContactMessage(deletingMsgId);
      if (res.success) {
        showToast('Message deleted.', 'success');
        setMessages(prev => prev.filter(m => m.id !== deletingMsgId));
      } else {
        showToast(res.error || 'Failed to delete message', 'error');
      }
      setDeletingMsgId(null);
    });
  };

  const confirmCancelBooking = async () => {
    if (!cancellingBookingId) return;
    startTransition(async () => {
      const res = await cancelBookingAdmin(cancellingBookingId, 'Cancelled via Studio Console');
      if (res.success) {
        showToast('Meeting cancelled.', 'success');
        setBookings(prev => prev.map(b => b.id === cancellingBookingId ? { ...b, status: 'cancelled' } : b));
      } else {
        showToast(res.error || 'Failed to cancel meeting', 'error');
      }
      setCancellingBookingId(null);
    });
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            CLIENT COMMUNICATIONS & MEETINGS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Contact &{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Inquiries
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {messages.length} direct inquiry messages &bull; {bookings.length} scheduled discovery call(s)
          </p>
        </div>

        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors self-start sm:self-auto"
        >
          <span>Public Contact Page</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <button
          onClick={() => setActiveTab('messages')}
          style={activeTab === 'messages' ? {
            borderColor: `${currentTheme.primary}50`,
            backgroundColor: `${currentTheme.primary}15`,
            color: '#ffffff',
            boxShadow: `0 0 12px ${currentTheme.glow}`,
          } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'messages'
              ? 'font-semibold border'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Mail size={14} style={activeTab === 'messages' ? { color: currentTheme.primary } : undefined} />
          <span>Direct Messages ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={activeTab === 'bookings' ? {
            borderColor: `${currentTheme.primary}50`,
            backgroundColor: `${currentTheme.primary}15`,
            color: '#ffffff',
            boxShadow: `0 0 12px ${currentTheme.glow}`,
          } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'bookings'
              ? 'font-semibold border'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CalendarCheck size={14} style={activeTab === 'bookings' ? { color: currentTheme.primary } : undefined} />
          <span>Scheduled Calls ({bookings.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading client communications from database...</span>
        </div>
      ) : activeTab === 'messages' ? (
        /* Messages Tab */
        messages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
            <Mail size={32} className="mx-auto text-neutral-600" />
            <p className="text-sm text-neutral-300 font-medium">No messages yet</p>
            <p className="text-xs text-neutral-500 font-mono">Incoming contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {m.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                        m.status === 'unread'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : m.status === 'replied'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-white/[0.04] text-neutral-400 border-white/[0.06]'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{m.email}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                    Topic: {m.topic || 'General Inquiry'}
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04]">
                    {m.message}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatus(m.id, m.status === 'unread' ? 'read' : 'unread')}
                      className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 transition-colors"
                    >
                      Mark as {m.status === 'unread' ? 'Read' : 'Unread'}
                    </button>
                    <button
                      onClick={() => handleStatus(m.id, 'replied')}
                      className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-colors"
                    >
                      Mark Replied
                    </button>
                  </div>

                  <button
                    onClick={() => setDeletingMsgId(m.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      ) : (
        /* Bookings Tab */
        bookings.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
            <CalendarCheck size={32} className="mx-auto text-neutral-600" />
            <p className="text-sm text-neutral-300 font-medium">No scheduled calls</p>
            <p className="text-xs text-neutral-500 font-mono">Bookings made via the discovery calendar appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {b.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <a
                      href={`mailto:${b.email}`}
                      className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{b.email}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-white block">
                      📅 {b.date} &bull; {b.time_slot}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {b.timezone || 'Asia/Dhaka'} ({b.duration || 30} mins)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                    Topic: {b.topic}
                  </span>
                  {b.additional_notes && (
                    <p className="text-xs text-neutral-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                      {b.additional_notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {b.meet_link ? (
                    <a
                      href={b.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 hover:underline"
                    >
                      <Video size={13} />
                      <span>Join Meeting Room</span>
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-neutral-500">Google Meet</span>
                  )}

                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => setCancellingBookingId(b.id)}
                      className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-mono text-rose-300 border border-rose-500/20 transition-colors"
                    >
                      Cancel Meeting
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )
      )}

      {/* Delete Message Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingMsgId)}
        title="Delete Message?"
        description="Are you sure you want to delete this client message from PostgreSQL?"
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteMsg}
        onClose={() => setDeletingMsgId(null)}
      />

      {/* Cancel Booking Confirmation */}
      <ConfirmModal
        isOpen={Boolean(cancellingBookingId)}
        title="Cancel Scheduled Call?"
        description="Are you sure you want to cancel this discovery call? Status will be updated to cancelled in database."
        confirmText="Cancel Call"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmCancelBooking}
        onClose={() => setCancellingBookingId(null)}
      />

    </div>
  );
}
