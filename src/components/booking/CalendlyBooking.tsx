'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { createBooking, getCalendlyAvailability } from '@/actions/contact';

// Official multi-color Google Meet SVG icon
function GoogleMeetIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 45.4 512 421.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m289.6 256 49.9 57 67.1 42.9 11.7-99.6-11.7-97.3-68.4 37.7z" fill="#00832d" />
      <path d="M0 346.7v84.8c0 19.4 15.7 35.1 35.1 35.1h84.8l17.6-64.1-17.6-55.8-58.2-17.6z" fill="#0066da" />
      <path d="M119.9 45.4 0 165.3l61.7 17.6 58.2-17.6 17.3-55.1z" fill="#e94235" />
      <path d="M119.9 165.3H0v181.4h119.9z" fill="#2684fc" />
      <path
        d="M483.3 96.2 406.6 159v196.9l77 63.1c11.5 9 28.4.8 28.4-13.9V109.7c0-14.8-17.2-22.9-28.7-13.5M289.6 256v90.7H119.9v119.9h251.6c19.4 0 35.1-15.7 35.1-35.1v-75.6z"
        fill="#00ac47"
      />
      <path
        d="M371.5 45.4H119.9v119.9h169.7V256l117-96.9V80.5c0-19.4-15.7-35.1-35.1-35.1"
        fill="#ffba00"
      />
    </svg>
  );
}

// Rohan Mia's actual avatar from Calendly
const ROHAN_AVATAR = 'https://d3v0px0pttie1i.cloudfront.net/uploads/user/avatar/52942764/5a655d69.png';

const TIMEZONES = [
  { label: 'Asia/Dhaka (GMT+6:00)', value: 'Asia/Dhaka' },
  { label: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata' },
  { label: 'Asia/Dubai (GMT+4:00)', value: 'Asia/Dubai' },
  { label: 'Asia/Singapore (GMT+8:00)', value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo (GMT+9:00)', value: 'Asia/Tokyo' },
  { label: 'Asia/Bangkok (GMT+7:00)', value: 'Asia/Bangkok' },
  { label: 'Europe/London (GMT+1:00)', value: 'Europe/London' },
  { label: 'Europe/Berlin (GMT+2:00)', value: 'Europe/Berlin' },
  { label: 'Europe/Paris (GMT+2:00)', value: 'Europe/Paris' },
  { label: 'Europe/Amsterdam (GMT+2:00)', value: 'Europe/Amsterdam' },
  { label: 'America/New_York (GMT-4:00)', value: 'America/New_York' },
  { label: 'America/Chicago (GMT-5:00)', value: 'America/Chicago' },
  { label: 'America/Denver (GMT-6:00)', value: 'America/Denver' },
  { label: 'America/Los_Angeles (GMT-7:00)', value: 'America/Los_Angeles' },
  { label: 'America/Toronto (GMT-4:00)', value: 'America/Toronto' },
  { label: 'America/Sao_Paulo (GMT-3:00)', value: 'America/Sao_Paulo' },
  { label: 'Australia/Sydney (GMT+11:00)', value: 'Australia/Sydney' },
  { label: 'Australia/Melbourne (GMT+11:00)', value: 'Australia/Melbourne' },
  { label: 'Pacific/Auckland (GMT+13:00)', value: 'Pacific/Auckland' },
  { label: 'UTC (GMT+0:00)', value: 'UTC' }
];

interface CalendlySpot {
  status: string;
  start_time: string;
  invitees_remaining?: number;
}

interface CalendlyDay {
  date: string;
  status: string;
  spots: CalendlySpot[];
}

function parseSpotTime(isoString: string): { time12: string; time24: string; endTime12: string } {
  try {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');

    // 24h
    const time24 = `${hours.toString().padStart(2, '0')}:${minutes}`;

    // 12h
    const ampm = hours >= 12 ? 'pm' : 'am';
    let hours12 = hours % 12;
    if (hours12 === 0) hours12 = 12;
    const time12 = `${hours12}:${minutes}${ampm}`;

    // End time (+30m)
    const endD = new Date(d.getTime() + 30 * 60 * 1000);
    let endHours = endD.getHours();
    const endMinutes = endD.getMinutes().toString().padStart(2, '0');
    const endAmpm = endHours >= 12 ? 'pm' : 'am';
    let endHours12 = endHours % 12;
    if (endHours12 === 0) endHours12 = 12;
    const endTime12 = `${endHours12}:${endMinutes}${endAmpm}`;

    return { time12, time24, endTime12 };
  } catch {
    return { time12: '11:30am', time24: '11:30', endTime12: '12:00pm' };
  }
}

interface CalendlyBookingProps {
  onSuccess?: () => void;
  className?: string;
  isModal?: boolean;
}

export default function CalendlyBooking({ onSuccess, className = '', isModal = false }: CalendlyBookingProps) {
  // Step: 1 = Date & Time, 2 = Enter Details Form, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Time format toggle: 12h vs 24h
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Timezone selection
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Dhaka');
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);

  // Calendar Date State (October 2026 active range, dynamic month navigation)
  const today = useMemo(() => new Date(2026, 9, 4), []); // Oct 4, 2026
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 9, 7)); // Oct 7 default as in screenshot
  const [selectedSpot, setSelectedSpot] = useState<{ time12: string; time24: string; endTime12: string; iso: string }>({
    time12: '2:00pm',
    time24: '14:00',
    endTime12: '2:30pm',
    iso: '2026-10-07T14:00:00+06:00'
  });

  // Live Calendly Availability Data
  const [availabilityDays, setAvailabilityDays] = useState<CalendlyDay[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Form State matching screenshot 2
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    additionalNotes: '',
    guests: ''
  });
  const [showGuests, setShowGuests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedMeetLink, setConfirmedMeetLink] = useState('');

  // Refs for Scroll Isolation & Click Outside
  const timeSlotsContainerRef = useRef<HTMLDivElement>(null);
  const timezoneDropdownRef = useRef<HTMLDivElement>(null);
  const timezoneButtonRef = useRef<HTMLButtonElement>(null);

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  }, [year, month]);

  // Fetch live Calendly availability when month or timezone changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchLiveAvailability() {
      setIsLoadingAvailability(true);
      const startStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
      const endStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

      try {
        const data = await getCalendlyAvailability({
          rangeStart: startStr,
          rangeEnd: endStr,
          timezone: selectedTimezone
        });

        if (!isCancelled && data && Array.isArray(data.days)) {
          setAvailabilityDays(data.days);
        }
      } catch (err) {
        console.error('Failed to fetch live availability:', err);
      } finally {
        if (!isCancelled) setIsLoadingAvailability(false);
      }
    }

    fetchLiveAvailability();

    return () => {
      isCancelled = true;
    };
  }, [year, month, daysInMonth, selectedTimezone]);

  // Handle clicking outside timezone dropdown or pressing Escape
  useEffect(() => {
    if (!showTimezoneSelect) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        timezoneDropdownRef.current &&
        !timezoneDropdownRef.current.contains(target) &&
        timezoneButtonRef.current &&
        !timezoneButtonRef.current.contains(target)
      ) {
        setShowTimezoneSelect(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTimezoneSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTimezoneSelect]);

  // Isolate wheel scroll on timezone dropdown: NEVER scroll page while cursor is inside dropdown
  useEffect(() => {
    const el = timezoneDropdownRef.current;
    if (!el || !showTimezoneSelect) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [showTimezoneSelect]);

  // Isolate wheel scroll on availability list: NEVER scroll page while cursor is inside availability
  useEffect(() => {
    const el = timeSlotsContainerRef.current;
    if (!el || step !== 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [step, availabilityDays]);

  // Look up available spots for the currently selected date
  const selectedDateKey = useMemo(() => {
    if (!selectedDate) return '';
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const d = selectedDate.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const currentDaySpots = useMemo(() => {
    const dayObj = availabilityDays.find((d) => d.date === selectedDateKey);
    if (dayObj && Array.isArray(dayObj.spots) && dayObj.spots.length > 0) {
      return dayObj.spots
        .filter((s) => s.status === 'available')
        .map((s) => ({
          ...parseSpotTime(s.start_time),
          iso: s.start_time
        }));
    }

    // Default standard consultation slots if API is still loading or offline
    const defaultSlots12 = [
      '11:30am', '12:00pm', '12:30pm', '01:00pm', '01:30pm',
      '02:00pm', '02:30pm', '03:00pm', '03:30pm', '04:00pm'
    ];
    return defaultSlots12.map((t12) => {
      const match = t12.match(/^(\d+):(\d+)(am|pm)$/i);
      let h = parseInt(match?.[1] || '11', 10);
      const min = match?.[2] || '30';
      const ap = match?.[3]?.toLowerCase() || 'am';
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      const t24 = `${h.toString().padStart(2, '0')}:${min}`;

      const endH = (h + Math.floor((parseInt(min, 10) + 30) / 60)) % 24;
      const endM = (parseInt(min, 10) + 30) % 60;
      const endAp = endH >= 12 ? 'pm' : 'am';
      let endH12 = endH % 12;
      if (endH12 === 0) endH12 = 12;
      const endTime12 = `${endH12}:${endM.toString().padStart(2, '0')}${endAp}`;

      return {
        time12: t12,
        time24: t24,
        endTime12,
        iso: `${selectedDateKey}T${t24}:00+06:00`
      };
    });
  }, [availabilityDays, selectedDateKey]);

  // Is day available in Calendly?
  const isDayAvailable = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayObj = availabilityDays.find((d) => d.date === dateStr);
    if (dayObj) {
      return dayObj.status === 'available' && Array.isArray(dayObj.spots) && dayObj.spots.length > 0;
    }
    const dayDate = new Date(year, month, day);
    const checkToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dayDate >= checkToday;
  };

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const dayDate = new Date(year, month, day);
    const checkToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dayDate < checkToday;
  };

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (isPast(day)) return;
    setSelectedDate(new Date(year, month, day));
  };

  const handleTimeSlotSelect = (spot: { time12: string; time24: string; endTime12: string; iso: string }) => {
    setSelectedSpot(spot);
    setStep(2);
  };

  // Submit Booking Form
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.topic.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const guestList = formData.guests
        ? formData.guests.split(',').map((g) => g.trim()).filter(Boolean)
        : [];

      const res = await createBooking({
        name: formData.name,
        email: formData.email,
        topic: formData.topic,
        additionalNotes: formData.additionalNotes,
        guests: guestList,
        date: selectedDateKey,
        timeSlot: selectedSpot.time12,
        timezone: selectedTimezone,
        duration: 30
      });

      if (res && res.success) {
        if (res.meetLink) setConfirmedMeetLink(res.meetLink);
        setStep(3);
        toast.success('Discovery call confirmed! Calendar invite sent.');
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.error || 'Failed to schedule meeting. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format short date: e.g. "Wed 7th"
  const formattedDayShort = useMemo(() => {
    if (!selectedDate) return '';
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = selectedDate.getDate();
    const getOrdinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    return `${dayName} ${getOrdinal(dayNum)}`;
  }, [selectedDate]);

  // Format full date: e.g. "Wednesday, October 7, 2026"
  const formattedDateFull = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [selectedDate]);

  return (
    <div
      className={`mx-auto rounded-2xl sm:rounded-3xl bg-[#0f1013] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 ${
        step === 1 ? 'w-full max-w-5xl' : step === 2 ? 'w-full max-w-3xl' : 'w-full max-w-xl'
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {/* =========================================================================
            STEP 1: DATE & TIME SELECTION (Screenshot 1: 3-column month view)
           ========================================================================= */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07] lg:h-[480px]"
          >
            {/* ----------------- LEFT PANEL: Host & Meeting Details ----------------- */}
            <div className="lg:col-span-4 p-6 sm:p-7 space-y-6 flex flex-col">
              <div className="space-y-4">
                {/* Host Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-800">
                    <Image
                      src={ROHAN_AVATAR}
                      alt="Rohan Mia"
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-zinc-400">
                    Rohan Mia
                  </span>
                </div>

                {/* Meeting Title */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    30 Min Meeting
                  </h3>
                </div>

                {/* Meta details list */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <CheckSquare size={15} className="text-zinc-400 shrink-0" />
                    <span>Requires confirmation</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Clock size={15} className="text-zinc-400 shrink-0" />
                    <span>30m</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <GoogleMeetIcon className="w-4 h-4 shrink-0" />
                    <span>Google Meet</span>
                  </div>

                  {/* Timezone Selector with Scrollable Dropdown */}
                  <div className="relative pt-1">
                    <button
                      ref={timezoneButtonRef}
                      type="button"
                      onClick={() => setShowTimezoneSelect(!showTimezoneSelect)}
                      className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Globe size={14} className="shrink-0" />
                      <span>{selectedTimezone}</span>
                      <span className="text-[10px] text-zinc-500">▾</span>
                    </button>

                    {showTimezoneSelect && (
                      <div
                        ref={timezoneDropdownRef}
                        data-lenis-prevent="true"
                        style={{
                          overscrollBehavior: 'contain',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}
                        className="absolute left-0 top-full mt-2 w-64 max-h-[145px] overflow-y-auto rounded-xl bg-[#16181f] border border-white/10 shadow-2xl p-1.5 z-50 space-y-1 text-xs overscroll-contain [&::-webkit-scrollbar]:hidden"
                      >
                        {TIMEZONES.map((tz) => (
                          <button
                            key={tz.value}
                            type="button"
                            onClick={() => {
                              setSelectedTimezone(tz.value);
                              setShowTimezoneSelect(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                              selectedTimezone === tz.value
                                ? 'bg-white/15 text-white font-medium'
                                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <span>{tz.label}</span>
                            {selectedTimezone === tz.value && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- MIDDLE PANEL: Calendar ----------------- */}
            <div className="lg:col-span-5 p-6 sm:p-7 space-y-5">
              {/* Month Header & Controls */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-semibold text-white">
                  {monthNames[month]} {year}
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              {/* Day Tiles Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {/* Empty padding slots before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 sm:h-11" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPast(day);
                  const selected = isSelected(day);
                  const currentDay = isToday(day);
                  const available = isDayAvailable(day) && !past;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!available}
                      onClick={() => handleDateClick(day)}
                      className={`relative h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                        selected
                          ? 'bg-white text-zinc-950 font-bold shadow-md scale-105 z-10'
                          : !available
                          ? 'text-zinc-600 cursor-not-allowed opacity-35'
                          : 'bg-[#1b1c21]/90 hover:bg-white/15 text-zinc-200 border border-white/[0.04]'
                      }`}
                    >
                      <span>{day}</span>
                      {/* Today dot indicator */}
                      {currentDay && (
                        <span
                          className={`w-1 h-1 rounded-full absolute bottom-1.5 ${
                            selected ? 'bg-zinc-950' : 'bg-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------- RIGHT PANEL: Availability Time Slots ----------------- */}
            <div className="lg:col-span-3 p-6 sm:p-7 space-y-4 flex flex-col">
              {/* Header: Selected day + 12h/24h Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {formattedDayShort}
                </span>

                {/* 12h / 24h Toggle */}
                <div className="inline-flex p-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      timeFormat === '12h'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    12h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      timeFormat === '24h'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    24h
                  </button>
                </div>
              </div>

              {/* Time Slots List with NO SCROLLBAR and COMPLETE ISOLATED SCROLL */}
              <div
                ref={timeSlotsContainerRef}
                data-lenis-prevent="true"
                style={{
                  overscrollBehavior: 'contain',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="space-y-2 overflow-y-auto max-h-[340px] pr-0 touch-pan-y overscroll-contain [&::-webkit-scrollbar]:hidden select-none"
              >
                {isLoadingAvailability && (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-zinc-400" />
                    <span>Loading available times...</span>
                  </div>
                )}

                {!isLoadingAvailability && currentDaySpots.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No available slots on this date.
                  </div>
                )}

                {!isLoadingAvailability &&
                  currentDaySpots.map((spot) => {
                    const displayTime = timeFormat === '24h' ? spot.time24 : spot.time12;
                    return (
                      <button
                        key={spot.iso}
                        type="button"
                        onClick={() => handleTimeSlotSelect(spot)}
                        className="w-full py-2.5 px-3 rounded-xl border border-white/[0.08] bg-[#16171c] hover:bg-white/[0.08] hover:border-white/20 text-white font-mono text-xs sm:text-sm text-center transition-all duration-150 cursor-pointer active:scale-[0.98] group flex items-center justify-center gap-1.5"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {displayTime}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 2: ENTER DETAILS FORM (Narrower card, exact same height as Step 1)
           ========================================================================= */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07] lg:h-[480px]"
          >
            {/* Left Panel: Meeting Recap Matching Screenshot 2 */}
            <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer w-fit mb-1"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>

                {/* Host Info */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-800">
                    <Image
                      src={ROHAN_AVATAR}
                      alt="Rohan Mia"
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-zinc-400">
                    Rohan Mia
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  30 Min Meeting
                </h3>

                {/* Recap metadata matching Screenshot 2 */}
                <div className="space-y-2.5 pt-1">
                  {/* Selected Date & Time */}
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CalendarIcon size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">{formattedDateFull}</p>
                      <p className="text-zinc-400 text-[11px]">
                        {selectedSpot.time12} – {selectedSpot.endTime12}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckSquare size={14} className="text-zinc-400 shrink-0" />
                    <span>Requires confirmation</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Clock size={14} className="text-zinc-400 shrink-0" />
                    <span>30m</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <GoogleMeetIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Google Meet</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Globe size={13} className="shrink-0" />
                    <span>{selectedTimezone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Enter Details Form Matching Screenshot 2 */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
              <form onSubmit={handleSubmitBooking} className="space-y-3 flex flex-col justify-between h-full">
                {/* Row 1: Name and Email side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300 block">
                      Your name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300 block">
                      Email address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* What is this meeting about? * */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    What is this meeting about? <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Project discussion, architecture review..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-all font-sans"
                  />
                </div>

                {/* Additional notes */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Additional notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder="Please share anything that will help prepare for our meeting."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-sans resize-none leading-relaxed"
                  />
                </div>

                {/* + Add guests */}
                <div>
                  {!showGuests ? (
                    <button
                      type="button"
                      onClick={() => setShowGuests(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer py-0.5"
                    >
                      <UserPlus size={13} />
                      <span>+ Add guests</span>
                    </button>
                  ) : (
                    <div className="space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-zinc-400 block">
                          Guest Email(s)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowGuests(false);
                            setFormData({ ...formData, guests: '' });
                          }}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                        >
                          <X size={11} /> Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="colleague@company.com"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#14151a] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 transition-all font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Terms and Privacy Policy Links */}
                <p className="text-[11px] text-zinc-500 pt-0.5 leading-snug">
                  By proceeding, you agree to Calendly&apos;s{' '}
                  <a
                    href="https://calendly.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white transition-colors no-underline"
                  >
                    Terms
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://calendly.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white transition-colors no-underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>

                {/* Action Buttons: Back and Confirm */}
                <div className="pt-1 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <span>Confirm</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 3: CONFIRMATION STATE
           ========================================================================= */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                You are scheduled!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                A calendar invitation with Google Meet video conferencing details has been sent to{' '}
                <span className="text-white font-medium">{formData.email}</span>.
              </p>
            </div>

            {/* Confirmed Details Box */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left max-w-md mx-auto space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="font-semibold text-white text-sm">30 Min Meeting</span>
                <span className="text-zinc-400">Rohan Mia</span>
              </div>
              <div className="space-y-2 text-zinc-300">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-zinc-400" />
                  <span>
                    {selectedSpot.time12} – {selectedSpot.endTime12}, {formattedDateFull}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-zinc-400" />
                  <span>{selectedTimezone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GoogleMeetIcon className="w-4 h-4 shrink-0" />
                  <span>Google Meet web conferencing link sent to email</span>
                </div>
              </div>

              {confirmedMeetLink && (
                <div className="pt-2">
                  <a
                    href={confirmedMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#00832d] hover:bg-[#007026] text-white font-medium text-xs transition-all shadow-md cursor-pointer"
                  >
                    <GoogleMeetIcon className="w-4 h-4 shrink-0" />
                    <span>Join Google Meet Room</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormData({
                    name: '',
                    email: '',
                    topic: '',
                    additionalNotes: '',
                    guests: ''
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Schedule Another Meeting
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
