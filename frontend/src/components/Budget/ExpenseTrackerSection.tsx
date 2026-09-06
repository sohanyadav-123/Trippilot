import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Receipt,
  Users,
  DollarSign,
  Calendar,
  X,
  Check,
  Tag,
  FileText,
  Layers,
  Plane,
  Building2,
  Car,
  Compass,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { Expense, BudgetCategories } from '../../types';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrencyAmount } from '../../utils/currencyUtils';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const ExpenseTrackerSection: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    actualSpent,
    baseCurrency,
    sharedMembers,
  } = useTripBuilder();
  const { t } = useTravelSettings();

  // Filter state
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Modal Form State
  const [formCategory, setFormCategory] = useState<keyof BudgetCategories>('food');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState<number>(1200);
  const [formCurrency, setFormCurrency] = useState<string>(baseCurrency);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formPaidBy, setFormPaidBy] = useState<string>('Sohan');
  const [formParticipants, setFormParticipants] = useState<string[]>(['Sohan', 'Rahul']);
  const [formNotes, setFormNotes] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingExpenseId(null);
    setFormCategory('food');
    setFormDesc('');
    setFormAmount(1200);
    setFormCurrency(baseCurrency);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaidBy(sharedMembers[0]?.name || 'Sohan');
    setFormParticipants(sharedMembers.map((m) => m.name));
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setFormCategory(exp.category);
    setFormDesc(exp.description);
    setFormAmount(exp.amount);
    setFormCurrency(exp.currency || baseCurrency);
    setFormDate(exp.date);
    setFormPaidBy(exp.paidBy || 'Sohan');
    setFormParticipants(exp.participants || ['Sohan']);
    setFormNotes(exp.notes || '');
    setModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || formAmount <= 0) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        category: formCategory,
        description: formDesc.trim(),
        amount: Number(formAmount),
        currency: formCurrency,
        date: formDate,
        paidBy: formPaidBy,
        participants: formParticipants,
        notes: formNotes.trim(),
      });
    } else {
      addExpense({
        category: formCategory,
        description: formDesc.trim(),
        amount: Number(formAmount),
        currency: formCurrency,
        date: formDate,
        paidBy: formPaidBy,
        participants: formParticipants,
        notes: formNotes.trim(),
        settlementStatus: 'unsettled',
      });
    }

    setModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    setDeleteConfirmId(null);
  };

  const toggleParticipant = (name: string) => {
    setFormParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedFilterCategory === 'all') return true;
    return e.category === selectedFilterCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'flights':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hotels':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'local_transport':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'activities':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const convertedPreview = formCurrency !== baseCurrency
    ? convertCurrency(formAmount, formCurrency, baseCurrency)
    : formAmount;

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('budget.tracker_badge', 'CONFIRMED SPEND TRACKER')}</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#0B1220] tracking-tight">
            {t('budget.tracker_title', 'Trip Expense Manager & Receipts')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('budget.tracker_subtitle', 'Log real payments and shared spends. Each entry updates your confirmed actual spend instantly.')}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-primary text-xs !py-2.5 px-4 font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('budget.log_expense', '+ Log New Expense')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Expenses' },
          { id: 'flights', label: 'Flights' },
          { id: 'hotels', label: 'Hotels' },
          { id: 'local_transport', label: 'Transport' },
          { id: 'activities', label: 'Activities' },
          { id: 'food', label: 'Food & Dining' },
          { id: 'shopping', label: 'Shopping' },
          { id: 'miscellaneous', label: 'Other' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedFilterCategory(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilterCategory === f.id
                ? 'bg-[#0B1220] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Expenses Table / Cards */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No expenses found in this category.</p>
          <p className="text-xs text-slate-400">Click "+ Log New Expense" to record a confirmed payment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  {getCategoryIcon(exp.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {exp.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{exp.date}</span>
                    {exp.paidBy && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Paid by <strong>{exp.paidBy}</strong>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#0B1220] mt-1">{exp.description}</h4>
                  {exp.notes && (
                    <p className="text-xs text-slate-500 mt-0.5 italic">Note: {exp.notes}</p>
                  )}
                  {exp.participants && exp.participants.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Split between: {exp.participants.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-base font-black text-[#0B1220] block">
                    {formatCurrencyAmount(exp.amount, exp.currency || baseCurrency)}
                  </span>
                  {exp.currency && exp.currency !== baseCurrency && (
                    <span className="text-[10.5px] text-slate-500 font-bold block">
                      ≈ ₹{Math.round(exp.convertedAmount || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(exp)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Edit Expense"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(exp.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Delete this expense?</h4>
            <p className="text-xs text-slate-500">
              Removing this expense will decrease your actual spent total and restore remaining budget.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExpense(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-base text-[#0B1220]">
                {editingExpenseId ? 'Edit Expense Entry' : 'Log New Confirmed Expense'}
              </h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    <option value="food">🍽️ Food & Dining</option>
                    <option value="flights">✈️ Flights / Travel</option>
                    <option value="hotels">🏨 Stays & Hotels</option>
                    <option value="local_transport">🚕 Transport & Cabs</option>
                    <option value="activities">🎟️ Activities & Tours</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="miscellaneous">📦 Other / Misc</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description / Place</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seafood Dinner at Fisherman's Wharf"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Amount</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-currency normalization notice */}
              {formCurrency !== baseCurrency && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center justify-between">
                  <span>Converted at standard rate:</span>
                  <span className="font-bold">≈ ₹{Math.round(convertedPreview).toLocaleString('en-IN')} INR</span>
                </div>
              )}

              {/* Paid By */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Paid By</label>
                <input
                  type="text"
                  value={formPaidBy}
                  onChange={(e) => setFormPaidBy(e.target.value)}
                  placeholder="e.g. Sohan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Participants Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Participants ({formParticipants.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Sohan', 'Rahul', 'Priya', 'Ananya'].map((name) => {
                    const isSelected = formParticipants.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleParticipant(name)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#0B1220] text-white border-[#0B1220]'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Notes / Bill Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via UPI, bill split equally"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs !py-2 px-5 font-bold rounded-xl shadow-xs"
                >
                  {editingExpenseId ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
