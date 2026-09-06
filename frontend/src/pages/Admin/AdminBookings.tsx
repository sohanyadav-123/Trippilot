import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  User as UserIcon,
  Tag,
  CreditCard,
  Calendar,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Booking } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings();
      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminService.updateBooking(id, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b))
      );
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch {
      alert('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const isDemo = b.booking_reference?.startsWith('DEMO-') || (b as any).is_demo;
      if (modeFilter === 'demo' && !isDemo) return false;
      if (modeFilter === 'live' && isDemo) return false;

      if (statusFilter !== 'all' && b.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const refMatch = b.booking_reference?.toLowerCase().includes(term);
        const emailMatch = b.contact?.email?.toLowerCase().includes(term);
        const nameMatch = b.traveller_details?.some((t) =>
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(term)
        );
        const destMatch = b.destination_title?.toLowerCase().includes(term);
        return refMatch || emailMatch || nameMatch || destMatch;
      }

      return true;
    });
  }, [bookings, searchTerm, statusFilter, modeFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const demoCount = bookings.filter(
      (b) => b.booking_reference?.startsWith('DEMO-') || (b as any).is_demo
    ).length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    return { total, confirmed, cancelled, pending, demoCount, totalRevenue };
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-blue-600" /> Platform Bookings Log
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of all customer reservations, payment statuses, and demo vs live bookings.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="btn-secondary text-xs !py-2 px-3 font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total Bookings</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{stats.demoCount} Sandbox Demo</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-400">Confirmed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.confirmed}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Active itineraries</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-400">Cancelled / Refunded</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.cancelled}</p>
          <span className="text-[10px] text-slate-400 font-semibold">{stats.pending} pending</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-400">Audited Volume</p>
          <div className="text-xl font-black text-slate-900 mt-1">
            <CurrencyDisplay amount={stats.totalRevenue} />
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Gross Booking Value</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Reference, Customer, Destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="demo">Demo / Sandbox</option>
              <option value="live">Live Bookings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading booking logs..." />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' || modeFilter !== 'all'
              ? 'No reservations matched your filter criteria.'
              : 'There are currently no bookings in the platform database.'}
          </p>
        </div>
      ) : (
        <div className="surface-card rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4 pl-6">Reference ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Destination & Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const isDemo = b.booking_reference?.startsWith('DEMO-') || (b as any).is_demo;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-mono font-bold text-blue-600 block">
                          {b.booking_reference}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>

                      <td className="p-4">
                        <strong className="text-slate-900 block font-semibold">
                          {b.traveller_details && b.traveller_details[0]
                            ? `${b.traveller_details[0].first_name} ${b.traveller_details[0].last_name}`
                            : 'Primary Guest'}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {b.contact?.email || 'N/A'}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs truncate text-slate-700">
                        <span className="font-bold text-slate-900 block truncate">
                          {b.destination_title || 'Trip Package'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {(b.breakdown || []).map((i) => i.description).join(' • ') || 'Flight + Hotel Reservation'}
                        </span>
                      </td>

                      <td className="p-4">
                        <CurrencyDisplay
                          amount={b.total_amount}
                          className="font-black text-slate-900 text-sm"
                        />
                      </td>

                      <td className="p-4">
                        {isDemo ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            DEMO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            LIVE
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status === 'confirmed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : b.status === 'cancelled' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {b.status}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base">
                    Booking Details: {selectedBooking.booking_reference}
                  </h2>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono">{selectedBooking.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Status</span>
                  <span className="text-sm font-black text-slate-900 capitalize">
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Environment</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                      selectedBooking.booking_reference?.startsWith('DEMO-')
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {selectedBooking.booking_reference?.startsWith('DEMO-') ? 'SANDBOX DEMO' : 'LIVE PRODUCTION'}
                  </span>
                </div>
              </div>

              {/* Travellers Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" /> Passenger / Guest Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedBooking.traveller_details || []).map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="font-bold text-slate-800">
                        {t.title ? `${t.title} ` : ''}{t.first_name} {t.last_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t.gender || 'Adult'} • DOB: {t.date_of_birth || 'N/A'} • {t.nationality || 'IN'}
                      </p>
                    </div>
                  ))}
                  {(!selectedBooking.traveller_details || selectedBooking.traveller_details.length === 0) && (
                    <p className="text-xs text-slate-400">No specific passenger records attached.</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact & Payment</h3>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <span className="font-bold text-slate-800">{selectedBooking.contact?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-800">{selectedBooking.contact?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Payment Ref / Txn ID</span>
                    <span className="font-mono text-[11px] text-slate-700">
                      {selectedBooking.payment_id || 'DEMO-SIM-001'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <CurrencyDisplay
                      amount={selectedBooking.total_amount}
                      className="font-black text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Breakdown items */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Line Items & Add-ons</h3>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {(selectedBooking.breakdown || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.description}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{item.type}</p>
                      </div>
                      <CurrencyDisplay amount={item.amount ?? item.price ?? 0} className="font-bold text-slate-900" />
                    </div>
                  ))}
                  {(!selectedBooking.breakdown || selectedBooking.breakdown.length === 0) && (
                    <div className="p-3 text-xs text-slate-400">Direct booking item</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <Link
                to={`/booking/confirmation/${selectedBooking.id}`}
                target="_blank"
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                View Customer Confirmation Voucher ↗
              </Link>
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
