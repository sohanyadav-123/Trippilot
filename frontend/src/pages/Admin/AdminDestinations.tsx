import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2, Edit2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Destination } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/Common/Modal';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';

export const AdminDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dailyBudget, setDailyBudget] = useState(3000);
  const [tags, setTags] = useState('beach, heritage');

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDestinations();
      if (res.success && res.data) {
        setDestinations(res.data.destinations || []);
      }
    } catch {
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      const res = await adminService.createDestination({
        city,
        country,
        description,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1587922546307-776227941871?w=800',
        average_daily_budget: Number(dailyBudget),
        tags: tagList,
        attractions: ['Popular Attraction 1', 'Historic Sight 2'],
        featured: true,
      });

      if (res.success && res.data) {
        setDestinations([res.data, ...destinations]);
        setModalOpen(false);
        setCity('');
        setCountry('');
        setDescription('');
      }
    } catch {
      alert('Failed to add destination');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await adminService.deleteDestination(id);
      setDestinations(destinations.filter((d) => d.id !== id));
    } catch {
      alert('Failed to delete destination');
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
            <MapPin className="w-7 h-7 text-blue-600" /> Manage Destinations ({destinations.length})
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {/* Table */}
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
                  <th className="p-4 pl-6">City & Country</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Avg. Budget</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destinations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-slate-900">{d.city}</span>
                      <span className="text-[10px] text-slate-400 block">{d.country}</span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs line-clamp-1">{d.description}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(d.tags || []).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <CurrencyDisplay amount={d.average_daily_budget || 4000} className="font-black text-slate-900 text-sm" />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete destination"
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

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Destination Guide" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">City Name</label>
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

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Avg. Daily Budget (INR)</label>
              <input
                type="number"
                required
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs !py-2 px-3 font-bold">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm">
              Save Destination
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
