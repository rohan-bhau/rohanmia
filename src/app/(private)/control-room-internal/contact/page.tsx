"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Mail,
  CalendarCheck,
  Trash2,
  Clock,
  ExternalLink,
  Loader2,
  ArrowUpRight,
  Video,
  X,
  Reply,
  CheckCircle2,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import {
  fetchAdminContactData,
  updateMessageStatus,
  removeContactMessage,
  cancelBookingAdmin,
  deleteBookingAdmin,
} from "@/actions/adminContact";
import { DbContactMessageRow, DbMeetingBookingRow } from "@/lib/db/contact";
import { useToast } from "@/components/admin/ui/Toast";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import AdminModal from "@/components/admin/ui/AdminModal";
import { useThemeAccent } from "@/components/theme/ThemeProvider";

export default function AdminContactPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<DbContactMessageRow[]>([]);
  const [bookings, setBookings] = useState<DbMeetingBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "bookings">(
    "messages",
  );

  // Selected item for full details view
  const [selectedMessage, setSelectedMessage] =
    useState<DbContactMessageRow | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<DbMeetingBookingRow | null>(null);

  // Deletion modal
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null,
  );
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      setLoading(true);
      const res = await fetchAdminContactData();
      if (!isMounted) return;

      if (res.success) {
        setMessages(res.messages || []);
        setBookings(res.bookings || []);
      } else {
        showToast(res.error || "Failed to load contact records", "error");
      }
      setLoading(false);
    };

    void refresh();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleStatus = async (
    id: string,
    status: "read" | "unread" | "replied",
  ) => {
    startTransition(async () => {
      const res = await updateMessageStatus(id, status);
      if (res.success) {
        showToast(`Message marked as ${status}.`, "success");
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m)),
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
        }
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    });
  };

  const confirmDeleteMsg = async () => {
    if (!deletingMsgId) return;
    startTransition(async () => {
      const res = await removeContactMessage(deletingMsgId);
      if (res.success) {
        showToast("Message deleted.", "success");
        setMessages((prev) => prev.filter((m) => m.id !== deletingMsgId));
        if (selectedMessage?.id === deletingMsgId) setSelectedMessage(null);
      } else {
        showToast(res.error || "Failed to delete message", "error");
      }
      setDeletingMsgId(null);
    });
  };

  const confirmCancelBooking = async () => {
    if (!cancellingBookingId) return;
    startTransition(async () => {
      const res = await cancelBookingAdmin(
        cancellingBookingId,
        "Cancelled via Studio Console",
      );
      if (res.success) {
        showToast("Meeting cancelled.", "success");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === cancellingBookingId ? { ...b, status: "cancelled" } : b,
          ),
        );
        if (selectedBooking?.id === cancellingBookingId) {
          setSelectedBooking((prev) =>
            prev ? { ...prev, status: "cancelled" } : null,
          );
        }
      } else {
        showToast(res.error || "Failed to cancel meeting", "error");
      }
      setCancellingBookingId(null);
    });
  };

  const confirmDeleteBooking = async () => {
    if (!deletingBookingId) return;
    startTransition(async () => {
      const res = await deleteBookingAdmin(deletingBookingId);
      if (res.success) {
        showToast("Booking deleted.", "success");
        setBookings((prev) => prev.filter((b) => b.id !== deletingBookingId));
        if (selectedBooking?.id === deletingBookingId) setSelectedBooking(null);
      } else {
        showToast(res.error || "Failed to delete booking", "error");
      }
      setDeletingBookingId(null);
    });
  };

  const unreadMsgCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-8 max-w-6xl px-4 sm:px-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            CLIENT COMMUNICATIONS &amp; DISCOVERY CALLS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Contact &{" "}
            <span
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
              }}
            >
              Inquiries
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {messages.length} direct inquiry messages &bull; {bookings.length}{" "}
            scheduled discovery call(s)
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
          type="button"
          onClick={() => setActiveTab("messages")}
          style={
            activeTab === "messages"
              ? {
                  borderColor: `${currentTheme.primary}50`,
                  backgroundColor: `${currentTheme.primary}15`,
                  color: "#ffffff",
                  boxShadow: `0 0 12px ${currentTheme.glow}`,
                }
              : undefined
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "messages"
              ? "font-semibold border"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Mail
            size={14}
            style={
              activeTab === "messages"
                ? { color: currentTheme.primary }
                : undefined
            }
          />
          <span>Direct Messages ({messages.length})</span>
          {unreadMsgCount > 0 && (
            <span
              className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {unreadMsgCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          style={
            activeTab === "bookings"
              ? {
                  borderColor: `${currentTheme.primary}50`,
                  backgroundColor: `${currentTheme.primary}15`,
                  color: "#ffffff",
                  boxShadow: `0 0 12px ${currentTheme.glow}`,
                }
              : undefined
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "font-semibold border"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <CalendarCheck
            size={14}
            style={
              activeTab === "bookings"
                ? { color: currentTheme.primary }
                : undefined
            }
          />
          <span>Scheduled Calls ({bookings.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading client inquiries from database...</span>
        </div>
      ) : activeTab === "messages" ? (
        /* ---------------- MESSAGES TAB (COMPACT LIST VIEW) ---------------- */
        messages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
            <Mail size={32} className="mx-auto text-neutral-600" />
            <p className="text-sm text-neutral-300 font-medium">
              No messages yet
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              Incoming contact form submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMessage(m)}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  m.status === "unread"
                    ? "bg-[#0e111a] border-white/20 hover:border-white/40 shadow-lg"
                    : "bg-[#0c0e14]/75 border-white/[0.06] hover:border-white/20 opacity-85 hover:opacity-100"
                }`}
              >
                {/* Left: Avatar + Details snippet */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`size-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 border ${
                      m.status === "unread"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        : "bg-white/[0.04] text-neutral-400 border-white/[0.08]"
                    }`}
                  >
                    {m.name?.charAt(0) || "M"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {m.name}
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        &lt;{m.email}&gt;
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                        {m.topic || "General"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 truncate max-w-xl mt-0.5 font-light">
                      {m.message}
                    </p>
                  </div>
                </div>

                {/* Right: Date, Status, Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                      m.status === "unread"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : m.status === "replied"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-white/[0.04] text-neutral-400 border-white/[0.06]"
                    }`}
                  >
                    {m.status}
                  </span>

                  <span className="text-[11px] font-mono text-neutral-500">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleDateString()
                      : "Recent"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingMsgId(m.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : /* ---------------- BOOKINGS TAB (COMPACT LIST VIEW) ---------------- */
      bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
          <CalendarCheck size={32} className="mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-300 font-medium">
            No scheduled calls
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            Bookings made via the discovery calendar appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0c0e14]/75 border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left: Calendar badge + Attendee Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
                  <Calendar size={13} style={{ color: currentTheme.primary }} />
                  <span className="text-[10px] font-mono text-white font-bold mt-0.5">
                    {b.date ? b.date.slice(5) : "CAL"}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {b.name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      &lt;{b.email}&gt;
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                      {b.topic}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    ⏰ {b.date} &bull; {b.time_slot} ({b.duration || 30} mins)
                  </p>
                </div>
              </div>

              {/* Right: Status badge & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                    b.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}
                >
                  {b.status}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingBookingId(b.id);
                  }}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Booking Record"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          FULL DETAILS MODAL: MESSAGE
         ======================================================== */}
      <AdminModal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="Inquiry Details"
        subtitle={`From ${selectedMessage?.name || "Client"}`}
        maxWidth="max-w-xl"
      >
        {selectedMessage && (
          <div className="space-y-5">
            {/* Sender Meta Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">
                  {selectedMessage.name}
                </p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>{selectedMessage.email}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="text-right space-y-1">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                    selectedMessage.status === "unread"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : selectedMessage.status === "replied"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-white/[0.04] text-neutral-400 border-white/[0.06]"
                  }`}
                >
                  {selectedMessage.status}
                </span>
                <p className="text-[10px] font-mono text-neutral-500">
                  {selectedMessage.created_at
                    ? new Date(selectedMessage.created_at).toLocaleString()
                    : "Recent"}
                </p>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Topic / Subject
              </span>
              <p className="text-xs font-medium text-white px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                {selectedMessage.topic || "General Inquiry"}
              </p>
            </div>

            {/* Message Body (Read-only, cannot be edited) */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Message Body
              </span>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleStatus(
                      selectedMessage.id,
                      selectedMessage.status === "unread" ? "read" : "unread",
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 transition-colors"
                >
                  Mark as{" "}
                  {selectedMessage.status === "unread" ? "Read" : "Unread"}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(selectedMessage.id, "replied")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-colors"
                >
                  Mark Replied
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.topic || "Portfolio Inquiry")}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black font-semibold text-xs font-mono hover:bg-neutral-200 transition-colors"
                >
                  <Reply size={12} />
                  <span>Reply via Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => setDeletingMsgId(selectedMessage.id)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Message"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ========================================================
          FULL DETAILS MODAL: BOOKING
         ======================================================== */}
      <AdminModal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Meeting Details"
        subtitle={`With ${selectedBooking?.name || "Client"}`}
        maxWidth="max-w-xl"
      >
        {selectedBooking && (
          <div className="space-y-3 sm:space-y-4">
            {/* Booking Summary Box */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">
                  {selectedBooking.name}
                </p>
                <a
                  href={`mailto:${selectedBooking.email}`}
                  className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>{selectedBooking.email}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="text-right space-y-0.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                    selectedBooking.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}
                >
                  {selectedBooking.status}
                </span>
                <p className="text-[10px] font-mono text-neutral-500">
                  📅 {selectedBooking.date}
                </p>
              </div>
            </div>

            {/* Time Slot & Timezone */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  Time Slot
                </span>
                <p className="text-xs font-mono text-white font-medium">
                  {selectedBooking.time_slot}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  Timezone
                </span>
                <p className="text-xs font-mono text-white font-medium">
                  {selectedBooking.timezone || "Asia/Dhaka"} (
                  {selectedBooking.duration || 30}m)
                </p>
              </div>
            </div>

            {/* Topic & Notes */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                Meeting Topic
              </span>
              <p className="text-xs font-medium text-white px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                {selectedBooking.topic}
              </p>
            </div>

            {selectedBooking.additional_notes && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Additional Notes
                </span>
                <p className="text-xs text-neutral-300 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {selectedBooking.additional_notes}
                </p>
              </div>
            )}

            {/* Join Room Link */}
            {selectedBooking.meet_link ? (
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-sky-300">
                  <Video size={13} />
                  <span>Google Meet Room</span>
                </div>
                <a
                  href={selectedBooking.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs font-mono transition-colors"
                >
                  Join Meeting
                </a>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
              {selectedBooking.status !== "cancelled" ? (
                <button
                  type="button"
                  onClick={() => setCancellingBookingId(selectedBooking.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel Call
                </button>
              ) : (
                <span className="text-xs font-mono text-rose-400">
                  Meeting Cancelled
                </span>
              )}

              <button
                type="button"
                onClick={() => setDeletingBookingId(selectedBooking.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/[0.08] text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Message Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingMsgId)}
        title="Delete Message?"
        description="Are you sure you want to permanently delete this client message from PostgreSQL?"
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
        description="Are you sure you want to cancel this discovery call? The status will be marked as cancelled in PostgreSQL."
        confirmText="Cancel Call"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmCancelBooking}
        onClose={() => setCancellingBookingId(null)}
      />

      {/* Delete Booking Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingBookingId)}
        title="Delete Booking Record?"
        description="Are you sure you want to permanently remove this booking record from PostgreSQL?"
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteBooking}
        onClose={() => setDeletingBookingId(null)}
      />
    </div>
  );
}
