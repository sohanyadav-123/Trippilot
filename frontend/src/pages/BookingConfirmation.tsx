import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Download,
  Share2,
  Printer,
  Sparkles,
  Plane,
  Building2,
  AlertCircle,
  ShieldCheck,
  Barcode,
  Copy,
  Check,
  XCircle,
  ExternalLink,
  Bell,
  FlaskConical,
  Luggage,
  Clock,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { useTravelSettings } from '../context/TravelSettingsContext';
import { LiveBookingTracker } from '../components/Common/LiveBookingTracker';

const generateICS = (booking: Booking): string => {
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const startDate = booking.created_at
    ? new Date(booking.created_at).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
    : now;
  const ref = booking.booking_reference;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripPilot//BookingCalendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${startDate}`,
    `DTSTAMP:${now}`,
    `UID:${ref}@trippilot.ai`,
    `SUMMARY:[DEMO] TripPilot Booking — ${ref}`,
    `DESCRIPTION:TripPilot Demo Booking Reference: ${ref}\\nContact: ${booking.contact?.email || ''}\\nThis is a simulated booking for demo purposes only.`,
    'LOCATION:TripPilot Platform (Demo)',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

const getGoogleCalendarUrl = (booking: Booking): string => {
  const ref = booking.booking_reference;
  const text = encodeURIComponent(`[DEMO] TripPilot Booking — ${ref}`);
  const details = encodeURIComponent(`Demo Booking Reference: ${ref}\nContact: ${booking.contact?.email || ''}\nSimulated booking — not a real reservation.`);
  const dates = '20260901T000000Z/20260901T010000Z';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}`;
};

const generateVoucherHtml = (booking: Booking): string => {
  const ref = booking.booking_reference;
  const traveller = booking.traveller_details?.[0];
  const name = traveller ? `${traveller.title || ''} ${traveller.first_name} ${traveller.last_name}`.trim() : 'Traveller';
  return `
    <html><head><title>TripPilot Booking Voucher — ${ref}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #111; max-width: 700px; margin: 0 auto; }
      .header { background: #0f172a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
      .badge { display: inline-block; background: #f59e0b; color: #78350f; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; }
      .ref { font-family: monospace; font-size: 22px; font-weight: 900; color: #34d399; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
      .field label { font-size: 10px; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 4px; }
      .field p { font-size: 14px; font-weight: 700; margin: 0; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
    </style></head>
    <body>
      <div class="header">
        <div class="badge">🧪 Demo Booking — Simulated Transaction</div>
        <div class="ref">${ref}</div>
        <p style="font-size:12px; color:#94a3b8; margin:4px 0 0">TripPilot Travel Voucher</p>
      </div>
      <div class="grid">
        <div class="field"><label>Lead Passenger</label><p>${name}</p></div>
        <div class="field"><label>Status</label><p style="color:#10b981">● Confirmed (Demo)</p></div>
        <div class="field"><label>Contact Email</label><p>${booking.contact?.email || '—'}</p></div>
        <div class="field"><label>Total Paid (Simulated)</label><p>₹${booking.total_amount?.toLocaleString('en-IN') || '0'}</p></div>
      </div>
      <div class="footer">
        ⚠ This is a DEMO booking confirmation. No real airline, hotel, or travel provider has been booked.
        This document is for demonstration purposes only and holds no monetary or contractual value.
      </div>
    </body></html>
  `;
};

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, t } = useTravelSettings();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cancelState, setCancelState] = useState<'idle' | 'confirm' | 'cancelled'>('idle');
  const [cancelling, setCancelling] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const localRaw = localStorage.getItem('trippilot_user_bookings');
        if (localRaw) {
          const localBookings: Booking[] = JSON.parse(localRaw);
          const found = localBookings.find((b) => b.id === id || b.booking_reference === id);
          if (found) {
            setBooking(found);
            setLoading(false);
            return;
          }
        }

        const res = await bookingService.getBooking(id);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          throw new Error('Not found');
        }
      } catch {
        const isDemoRef = id?.startsWith('DEMO-TRP-') || id?.startsWith('TP-');
        const mockConfirmed: Booking = {
          id: id || 'unknown',
          booking_reference: isDemoRef ? id! : `DEMO-TRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          selected_items: [],
          traveller_details: [{ title: 'Mr', first_name: 'Sohan', last_name: 'Yadav' }],
          contact: { email: 'sohan.yadav@example.com', phone: '+91 9876543210', country_code: '+91' },
          total_amount: 4199,
          subtotal: 3900,
          taxes: 299,
          service_fee: 0,
          currency: 'INR',
          breakdown: [],
          payment_id: 'pay_demo_mock',
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setBooking(mockConfirmed);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Fire a booking confirmation notification once
  useEffect(() => {
    if (booking && !notifSent) {
      try {
        addNotification?.({
          type: 'hotel',
          title: `Booking Confirmed — ${booking.booking_reference}`,
          message: `Your demo trip has been confirmed. Reference: ${booking.booking_reference}. No real reservation was made — this is sandbox mode.`,
          category: 'booking_reminder',
          priority: 'important',
        });
        setNotifSent(true);
      } catch { /* addNotification may not exist in older context */ }
    }
  }, [booking, notifSent, addNotification]);

  const handleCopyRef = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.booking_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadICS = () => {
    if (!booking) return;
    const ics = generateICS(booking);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trippilot-${booking.booking_reference}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadVoucher = () => {
    if (!booking) return;
    const html = generateVoucherHtml(booking);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TripPilot-Voucher-${booking.booking_reference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareTrip = async () => {
    const ref = booking?.booking_reference || '';
    const shareData = {
      title: `TripPilot Booking — ${ref}`,
      text: `I just booked a trip on TripPilot! Reference: ${ref} (Demo)`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch { /* user cancelled */ }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 1000));
    try {
      await bookingService.cancelBooking(booking.id);
    } catch { /* allow local cancel even if API fails */ }

    const localRaw = localStorage.getItem('trippilot_user_bookings');
    if (localRaw) {
      const arr: Booking[] = JSON.parse(localRaw);
      const updated = arr.map((b) =>
        b.id === booking.id || b.booking_reference === booking.booking_reference
          ? { ...b, status: 'cancelled' as any }
          : b
      );
      localStorage.setItem('trippilot_user_bookings', JSON.stringify(updated));
    }
    setBooking((prev) => prev ? { ...prev, status: 'cancelled' as any } : prev);
    setCancelState('cancelled');
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-bold text-slate-500">{t('confirmation.generating_voucher', 'Generating demo e-ticket voucher...')}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">{t('confirmation.not_found_title', 'Booking Reference Not Found')}</h2>
        <p className="text-slate-500">{t('confirmation.not_found_desc', 'We could not locate this reservation in our system.')}</p>
        <Link to="/" className="btn-primary inline-block">{t('confirmation.return_home', 'Return to Homepage')}</Link>
      </div>
    );
  }

  const isCancelled = booking.status === 'cancelled';
  const isDemoRef = booking.booking_reference.startsWith('DEMO-TRP-') || booking.booking_reference.startsWith('TP-');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* DEMO Badge Banner */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-300">
        <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-[11px] font-bold text-amber-800">
          {t('confirmation.demo_banner', '🧪 DEMO BOOKING — This is a simulated confirmation. No real airline, hotel, or travel provider has been reserved. No money was charged.')}
        </p>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" /> {t('confirmation.link_copied', 'Link copied to clipboard!')}
        </div>
      )}

      {/* Top Success Banner */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-3xl ${isCancelled ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600'} border flex items-center justify-center mx-auto shadow-sm`}>
          {isCancelled
            ? <XCircle className="w-8 h-8" />
            : <CheckCircle2 className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isCancelled ? t('confirmation.status_cancelled', 'Booking Cancelled') : t('confirmation.status_confirmed', 'Demo Booking Confirmed!')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          {isCancelled
            ? t('confirmation.cancelled_desc', 'This demo booking has been cancelled. No charges were applied.')
            : <>
                {t('confirmation.confirmed_desc_prefix', "We've generated a")}{' '}
                <strong>{t('confirmation.demo_confirmation', 'demo confirmation')}</strong>{' '}
                {t('confirmation.for_email', 'for')}{' '}
                <strong className="text-slate-900">{booking.contact?.email}</strong>.{' '}
                {t('confirmation.no_real_reservation', 'No real reservation exists.')}
              </>
          }
        </p>
      </div>

      {/* Real-time Live Flight, Hotel Location & Booking Telemetry */}
      {!isCancelled && (
        <LiveBookingTracker
          booking={booking}
          pollingIntervalMs={8000}
          onRefresh={async () => {
            try {
              if (booking?.id) {
                await bookingService.getLiveStatus(booking.id);
              }
            } catch {
              // fallback
            }
          }}
        />
      )}

      {/* Printable E-Ticket Card */}
      <div className="surface-card rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-white print:border-black print:shadow-none">
        {/* Card Header */}
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                {isDemoRef ? t('confirmation.demo_eticket', 'DEMO E-TICKET') : t('confirmation.official_eticket', 'OFFICIAL E-TICKET')}
              </span>
              <h2 className="text-xl font-black tracking-tight">{t('confirmation.voucher_title', 'TripPilot Travel Voucher')}</h2>
              {isDemoRef && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">
                  <FlaskConical className="w-2.5 h-2.5" /> {t('confirmation.sandbox_badge', 'DEMO / SANDBOX')}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">{t('confirmation.booking_reference', 'Booking Reference')}</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-mono text-sm font-bold text-emerald-400">{booking.booking_reference}</span>
                <button
                  onClick={handleCopyRef}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={t('confirmation.copy_ref', 'Copy reference')}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className={`text-[10px] font-bold mt-0.5 block ${isCancelled ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isCancelled ? t('confirmation.cancelled_badge', '✗ CANCELLED') : t('confirmation.confirmed_badge', '✓ CONFIRMED')}
              </span>
            </div>
          </div>
        </div>

        {/* Passenger & Reservation Details */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('confirmation.lead_passenger', 'Lead Passenger')}</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {booking.traveller_details?.[0]?.title}{' '}
                {booking.traveller_details?.[0]?.first_name}{' '}
                {booking.traveller_details?.[0]?.last_name}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('confirmation.status', 'Status')}</span>
              <span className={`font-bold inline-block mt-0.5 ${isCancelled ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isCancelled ? t('confirmation.cancelled_pill', '✗ Cancelled') : t('confirmation.confirmed_demo_pill', '● Confirmed (Demo)')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('confirmation.payment_mode', 'Payment Mode')}</span>
              <span className="font-bold text-slate-900 inline-block mt-0.5">{t('confirmation.payment_sandbox', 'Demo Sandbox')}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('confirmation.total_simulated', 'Total (Simulated)')}</span>
              <CurrencyDisplay amount={booking.total_amount} className="font-black text-slate-900 mt-0.5 block" />
            </div>
          </div>

          {/* Itinerary Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{t('confirmation.itinerary_inclusions', 'Itinerary Inclusions')}</h3>
            {booking.selected_items && booking.selected_items.length > 0 ? (
              booking.selected_items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                      {item.type === 'flight' ? <Plane className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.type === 'flight'
                          ? `${item.flight_data?.airline} • ${item.flight_data?.origin} → ${item.flight_data?.destination}`
                          : item.hotel_data?.name || t('confirmation.hotel_stay', 'Hotel Stay')}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {item.type === 'flight'
                          ? `Flight ${item.flight_data?.flight_number} • ${item.flight_data?.cabin_class || 'Economy'}`
                          : `${item.hotel_data?.city ? item.hotel_data.city + ' • ' : ''}${t('confirmation.verified_stay', 'Verified Stay')}`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isCancelled ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {isCancelled ? t('confirmation.cancelled_tag', 'Cancelled') : t('confirmation.demo_confirmed_tag', 'Demo Confirmed')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span>IndiGo 6E-2041 (DEL → GOI) • Non-stop • Demo Reservation</span>
              </div>
            )}
          </div>

          {/* Add-ons section */}
          {booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-blue-600" /> {t('confirmation.addons_selected', 'Add-ons Selected')}
              </h3>
              {booking.addons.map((addon: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-slate-700">{addon.label || addon.name}</span>
                  <CurrencyDisplay amount={addon.price || 0} className="font-bold text-blue-700" />
                </div>
              ))}
            </div>
          )}

          {/* Barcode & Security */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Barcode className="w-16 h-10 text-slate-700" />
              <span className="font-mono text-xs text-slate-400">{booking.booking_reference}-DEMO</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] text-slate-500 font-semibold">{t('confirmation.sandbox_id_label', 'TripPilot Sandbox Booking ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <button
          onClick={handleDownloadVoucher}
          className="btn-secondary text-xs !py-2.5 px-3 font-bold flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" /> {t('action.download', 'Download Voucher')}
        </button>
        <button
          onClick={() => window.print()}
          className="btn-secondary text-xs !py-2.5 px-3 font-bold flex items-center justify-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> {t('confirmation.print', 'Print')}
        </button>
        <button
          onClick={handleShareTrip}
          className="btn-secondary text-xs !py-2.5 px-3 font-bold flex items-center justify-center gap-1.5"
        >
          <Share2 className="w-4 h-4" /> {t('confirmation.share', 'Share')}
        </button>
        <button
          onClick={handleShareTrip}
          className="btn-secondary text-xs !py-2.5 px-3 font-bold flex items-center justify-center gap-1.5"
          title="Also copy link"
        >
          <ExternalLink className="w-3.5 h-3.5" /> {t('confirmation.share_link', 'Share Link')}
        </button>
      </div>

      {/* Calendar Buttons */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={handleDownloadICS}
          className="btn-secondary text-xs !py-2.5 px-4 font-bold flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-blue-600" /> {t('confirmation.add_ics', 'Add to Calendar (.ics)')}
        </button>
        <a
          href={getGoogleCalendarUrl(booking)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs !py-2.5 px-4 font-bold flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-red-500" /> {t('confirmation.add_gcal', 'Add to Google Calendar')}
        </a>
      </div>

      {/* Cancel Booking Section */}
      {!isCancelled && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 print:hidden">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('confirmation.cancel_section_title', 'Demo Cancellation')}</h4>
          </div>
          {cancelState === 'idle' && (
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500">{t('confirmation.cancel_section_desc', 'Cancel this demo booking. No charges apply.')}</p>
              <button
                onClick={() => setCancelState('confirm')}
                className="text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                {t('confirmation.cancel_btn', 'Cancel Booking')}
              </button>
            </div>
          )}
          {cancelState === 'confirm' && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-700">{t('confirmation.cancel_prompt', 'Are you sure you want to cancel this demo booking?')}</p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setCancelState('idle')}
                  className="btn-secondary text-xs !py-1.5 px-3 font-bold"
                >
                  {t('confirmation.keep_it', 'Keep It')}
                </button>
                <button
                  disabled={cancelling}
                  onClick={handleCancelBooking}
                  className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                >
                  {cancelling ? t('confirmation.cancelling', 'Cancelling...') : t('confirmation.yes_cancel', 'Yes, Cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden pt-2">
        <Link to="/my-bookings" className="btn-secondary text-xs !py-2.5 px-4 font-bold">
          {t('confirmation.view_my_trips', 'View All My Trips')}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="btn-secondary text-xs !py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" /> {t('confirmation.notifications', 'Notifications')}
          </Link>
          <Link
            to="/ai-planner"
            className="btn-primary text-xs !py-2.5 px-4 font-bold shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> {t('confirmation.plan_next', 'Plan Next Trip')}
          </Link>
        </div>
      </div>
    </div>
  );
};
