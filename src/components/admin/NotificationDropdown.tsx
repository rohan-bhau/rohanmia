'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Mail, 
  CalendarCheck, 
  BookOpen, 
  CheckCheck, 
  ExternalLink,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { 
  fetchAdminNotifications, 
  markAdminNotificationRead, 
  markAllAdminNotificationsRead, 
  AdminNotificationItem 
} from '@/actions/adminNotifications';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

function timeAgo(dateStr: string): string {
  try {
    const now = new Date().getTime();
    const past = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Recent';
  }
}

export default function NotificationDropdown({ basePath }: { basePath: string }) {
  const { currentTheme } = useThemeAccent();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const res = await fetchAdminNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for live notifications
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAdminNotificationsRead();
  };

  const handleItemClick = async (item: AdminNotificationItem) => {
    if (!item.isRead) {
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await markAdminNotificationRead(item.type, item.sourceId);
    }
    setIsOpen(false);
    // Determine proper destination with basePath
    const dest = item.type === 'guestbook' 
      ? `${basePath}/guestbook` 
      : `${basePath}/contact`;
    router.push(dest);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer group ${
          isOpen 
            ? 'bg-white/10 text-white border-white/20' 
            : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-neutral-400 hover:text-white'
        }`}
        title="Notifications & Activity"
      >
        <Bell size={15} className="group-hover:rotate-12 transition-transform duration-200" />
        
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold text-white flex items-center justify-center border border-black shadow-lg animate-pulse"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl sm:rounded-3xl bg-[#08090d]/95 border border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-medium text-white tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
                  style={{ 
                    backgroundColor: `${currentTheme.primary}20`,
                    color: currentTheme.primary
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <CheckCheck size={12} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <Sparkles size={24} className="mx-auto text-neutral-600" />
                <p className="text-xs font-medium text-neutral-300">All caught up!</p>
                <p className="text-[11px] font-mono text-neutral-500">
                  New visitor messages, bookings, or guestbook signatures will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = 
                  item.type === 'contact' ? Mail :
                  item.type === 'booking' ? CalendarCheck :
                  BookOpen;

                const iconColor = 
                  item.type === 'contact' ? '#38bdf8' : // sky
                  item.type === 'booking' ? '#34d399' : // emerald
                  '#c084fc'; // purple

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 border ${
                      !item.isRead 
                        ? 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08]' 
                        : 'bg-transparent border-transparent hover:bg-white/[0.03] opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* Icon or Avatar */}
                    <div 
                      className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border mt-0.5 overflow-hidden"
                      style={{
                        backgroundColor: `${iconColor}15`,
                        borderColor: `${iconColor}30`,
                        color: iconColor,
                      }}
                    >
                      {item.avatar ? (
                        <img 
                          src={item.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Icon size={14} />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-medium truncate ${!item.isRead ? 'text-white' : 'text-neutral-300'}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!item.isRead && (
                      <span 
                        className="w-2 h-2 rounded-full shrink-0 mt-2"
                        style={{ 
                          backgroundColor: currentTheme.primary,
                          boxShadow: `0 0 6px ${currentTheme.primary}`
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer Links */}
          <div className="p-2.5 border-t border-white/[0.08] bg-white/[0.01] grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
            <Link
              href={`${basePath}/contact`}
              onClick={() => setIsOpen(false)}
              className="py-1.5 px-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Client Inquiries &rarr;
            </Link>
            <Link
              href={`${basePath}/guestbook`}
              onClick={() => setIsOpen(false)}
              className="py-1.5 px-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Guestbook &rarr;
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
