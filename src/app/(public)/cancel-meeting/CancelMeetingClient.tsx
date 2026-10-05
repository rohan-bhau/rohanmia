'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarX, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Calendar } from 'lucide-react';

interface BookingData {
  id: string;
  name: string;
  email: string;
  topic: string;
  date: string;
  timeSlot: string;
  timezone: string;
  status: string;
  cancellationReason?: string;
}

export default function CancelMeetingClient({
  booking,
  formattedDate,
  timeRange,
}: {
  booking: BookingData | null;
  formattedDate: string;
  timeRange: string;
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(booking?.status === 'cancelled');
  const [errorMessage, setErrorMessage] = useState('');

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Meeting Not Found</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            The booking link you followed appears to be invalid or may have expired.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/contact#meeting"
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition"
            >
              Book a Meeting
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel event');
      }

      setIsCancelled(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already Cancelled / Successfully Cancelled View
  if (isCancelled) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Meeting Cancelled
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-sm mx-auto">
            Your 30-minute meeting with Rohan Mia has been cancelled. A confirmation email has been sent to your inbox.
          </p>

          <div className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200/80 dark:border-gray-800/80 rounded-xl p-4 text-left mb-6 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Event Details
            </div>
            <div className="font-semibold text-gray-900 dark:text-white line-through opacity-80">
              30 Min Meeting with Rohan Mia
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-through">
              {formattedDate} &bull; {timeRange} ({booking.timezone})
            </div>
            {reason && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Reason:</span> &ldquo;{reason}&rdquo;
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact#meeting"
              className="flex-1 py-3 px-5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl text-center transition shadow-sm"
            >
              Schedule Another Meeting
            </Link>
            <Link
              href="/"
              className="py-3 px-5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium rounded-xl text-center transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Flow (Exact Calendly cancellation screen)
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-7 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <CalendarX className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Event</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please confirm that you would like to cancel this scheduled session.
            </p>
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200/80 dark:border-gray-800/80 rounded-xl p-4 sm:p-5 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Scheduled Session
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            30 Min Meeting with Rohan Mia
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
            {formattedDate}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {timeRange} ({booking.timezone})
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800/80">
            Attendee: <span className="text-gray-700 dark:text-gray-300 font-medium">{booking.name}</span> ({booking.email})
          </div>
        </div>

        {/* Optional Reason for Canceling */}
        <div className="mb-6">
          <label
            htmlFor="cancellation-reason"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2"
          >
            Reason for canceling (optional)
          </label>
          <textarea
            id="cancellation-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please share why you need to cancel..."
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition resize-none"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            A formal cancellation email will be sent to both you and Rohan Mia.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Link
            href="/contact"
            className="flex-1 py-2.5 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          >
            Never mind, keep it
          </Link>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 text-center text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Canceling Event...
              </>
            ) : (
              'Cancel Event'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
