import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Trash2, ArrowLeft, Star } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Hotel } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/Common/Modal';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';

export const AdminHotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [city, setCity] = useState('Goa');
  const [country, setCountry] = useState('India');
  const [pricePerNight, setPricePerNight] = useState(8500);
  const [rating, setRating] = useState(4.7);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState('Pool, Spa, WiFi, Restaurant');

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await adminService.getHotels();
      if (res.success && res.data) {
        setHotels(res.data.hotels || []);
      }
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenityList = amenities.split(',').map((a) => a.trim());
      const res = await adminService.createHotel({
        name,
        city,
        country,
        price_per_night: Number(pricePerNight),
        rating: Number(rating),
        description,
        amenities: amenityList,
        image_urls: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        available_rooms: 25,
        room_types: ['Deluxe', 'Suite'],
        cancellation_policy: 'Free cancellation up to 48 hours before check-in',
      });

      if (res.success && res.data) {
        setHotels([res.data, ...hotels]);
        setModalOpen(false);
        setName('');
        setDescription('');
      }
    } catch {
      alert('Failed to add hotel.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this hotel?')) return;
    try {
      await adminService.deleteHotel(id);
      setHotels(hotels.filter((h) => h.id !== id));
    } catch {
      alert('Failed to delete hotel.');
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
            <Building2 className="w-7 h-7 text-blue-600" /> Manage Hotels & Stays ({hotels.length})
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Hotel Property
        </button>
      </div>

      {/* Hotel Table */}
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
                  <th className="p-4 pl-6">Hotel Property</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Nightly Rate</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-slate-900">{h.name}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{h.description}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {h.city}, {h.country}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {h.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <CurrencyDisplay amount={h.price_per_night} className="font-black text-slate-900 text-sm" />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete hotel"
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

      {/* Add Hotel Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Hotel Property" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Hotel Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grand Hyatt Goa"
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nightly Rate (INR)</label>
              <input
                type="number"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Rating (1.0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short overview of resort amenities..."
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Amenities (Comma separated)</label>
            <input
              type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className="input-field text-xs py-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs !py-2 px-3 font-bold">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm">
              Save Hotel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
