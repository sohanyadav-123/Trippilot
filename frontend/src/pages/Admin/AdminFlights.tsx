import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Flight } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/Common/Modal';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';

export const AdminFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [airline, setAirline] = useState('IndiGo');
  const [flightNumber, setFlightNumber] = useState('6E-452');
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Goa');
  const [price, setPrice] = useState(4500);
  const [duration, setDuration] = useState(2.5);
  const [seats, setSeats] = useState(60);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFlights();
      if (res.success && res.data) {
        setFlights(res.data.flights || []);
      }
    } catch {
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const dep = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const arr = new Date(dep.getTime() + duration * 60 * 60 * 1000);

      const res = await adminService.createFlight({
        airline,
        flight_number: flightNumber,
        origin,
        destination,
        price: Number(price),
        duration: Number(duration),
        seats_available: Number(seats),
        stops: 0,
        cabin_class: 'economy',
        departure_time: dep.toISOString(),
        arrival_time: arr.toISOString(),
        baggage_policy: '15kg check-in, 7kg cabin',
        cancellation_policy: 'Free cancellation up to 24h prior',
      });

      if (res.success && res.data) {
        setFlights([res.data, ...flights]);
        setModalOpen(false);
      }
    } catch {
      alert('Failed to add flight.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this flight?')) return;
    try {
      await adminService.deleteFlight(id);
      setFlights(flights.filter((f) => f.id !== id));
    } catch {
      alert('Failed to delete flight.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link to="/admin" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Plane className="w-7 h-7 text-blue-600" /> Manage Flight Inventory ({flights.length})
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Flight
        </button>
      </div>

      {/* Flight Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="surface-card rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4 pl-6">Airline / Flight #</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Seats Left</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-slate-900">{f.airline}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{f.flight_number}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {f.origin} → {f.destination}
                    </td>
                    <td className="p-4 text-slate-600">{f.duration}h</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                        {f.seats_available}
                      </span>
                    </td>
                    <td className="p-4">
                      <CurrencyDisplay amount={f.price} className="font-black text-slate-900 text-sm" />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete flight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Flight Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Flight Schedule" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Airline</label>
              <input
                type="text"
                required
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Flight Number</label>
              <input
                type="text"
                required
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Origin City</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination City</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Price (INR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.1"
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Available Seats</label>
              <input
                type="number"
                required
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs !py-2 px-3 font-bold">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm">
              Save Flight
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
