import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Trash2,
  Edit2,
  Star,
  Check,
  Armchair,
  Utensils,
  ShieldCheck,
} from 'lucide-react';
import { useTravellers, SavedTraveller } from '../context/TravellersContext';

export const SavedTravellersPage: React.FC = () => {
  const {
    travellers,
    addTraveller,
    updateTraveller,
    deleteTraveller,
    setDefaultTraveller,
  } = useTravellers();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState('1998-05-14');
  const [nationality, setNationality] = useState('Indian');
  const [seatPref, setSeatPref] = useState<'window' | 'aisle' | 'no_preference'>('window');
  const [mealPref, setMealPref] = useState<'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference'>('vegetarian');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('male');
    setDob('1998-01-01');
    setNationality('Indian');
    setSeatPref('window');
    setMealPref('vegetarian');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (t: SavedTraveller) => {
    setEditingId(t.id);
    setFirstName(t.firstName);
    setLastName(t.lastName);
    setGender(t.gender);
    setDob(t.dob);
    setNationality(t.nationality);
    setSeatPref(t.seatPreference || 'window');
    setMealPref(t.mealPreference || 'vegetarian');
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    if (editingId) {
      updateTraveller(editingId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dob,
        nationality,
        seatPreference: seatPref,
        mealPreference: mealPref,
      });
    } else {
      addTraveller({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dob,
        nationality,
        seatPreference: seatPref,
        mealPreference: mealPref,
      });
    }

    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Profile Hub</span>
      </Link>

      {/* Header */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Saved Co-Travellers Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Speed up flight & hotel checkouts by saving family & frequent travel companion profiles
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="btn-primary text-xs !py-2.5 px-4 font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Traveller</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal/Section */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="surface-card p-6 rounded-3xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {editingId ? 'Edit Traveller Profile' : 'Add New Co-Traveller'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="input-field text-xs py-2"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Seat Preference</label>
              <select
                value={seatPref}
                onChange={(e) => setSeatPref(e.target.value as any)}
                className="input-field text-xs py-2"
              >
                <option value="window">Window</option>
                <option value="aisle">Aisle</option>
                <option value="no_preference">No Preference</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Meal Preference</label>
              <select
                value={mealPref}
                onChange={(e) => setMealPref(e.target.value as any)}
                className="input-field text-xs py-2"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non_vegetarian">Non-Veg</option>
                <option value="vegan">Vegan</option>
                <option value="no_preference">No Preference</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary text-xs !py-2 px-4 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs !py-2 px-5 font-bold shadow-xs"
            >
              {editingId ? 'Update Traveller' : 'Save Traveller'}
            </button>
          </div>
        </form>
      )}

      {/* Travellers Grid */}
      <div className="space-y-3">
        {travellers.map((traveller) => (
          <div
            key={traveller.id}
            className="surface-card p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                {traveller.firstName[0]}
                {traveller.lastName[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900">
                    {traveller.firstName} {traveller.lastName}
                  </h3>
                  {traveller.isDefault ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Default Traveller
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultTraveller(traveller.id)}
                      className="text-[10px] text-slate-400 hover:text-amber-600 font-semibold"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="capitalize">{traveller.gender}</span>
                  <span>•</span>
                  <span>DOB: {traveller.dob}</span>
                  <span>•</span>
                  <span>{traveller.nationality}</span>
                  {traveller.seatPreference && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{traveller.seatPreference} seat</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleStartEdit(traveller)}
                className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-colors"
                title="Edit traveller"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteTraveller(traveller.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                title="Delete traveller"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
