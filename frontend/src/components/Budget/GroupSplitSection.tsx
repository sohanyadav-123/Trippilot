import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  UserCheck,
  Plus,
  PieChart,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const GroupSplitSection: React.FC = () => {
  const {
    settlementBalances,
    groupExpenses,
    addGroupExpense,
    settleGroupExpense,
    sharedMembers,
    baseCurrency,
  } = useTripBuilder();
  const { t } = useTravelSettings();

  // Log shared group expense inline form
  const [showAddForm, setShowAddForm] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupAmount, setGroupAmount] = useState<number>(3000);
  const [groupPayer, setGroupPayer] = useState<string>(sharedMembers[0]?.name || 'Sohan');
  const [groupSplitMode, setGroupSplitMode] = useState<'equal' | 'custom'>('equal');
  const [selectedSplitMembers, setSelectedSplitMembers] = useState<string[]>(
    sharedMembers.map((m) => m.name)
  );

  const toggleSplitMember = (name: string) => {
    setSelectedSplitMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleAddGroupExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || groupAmount <= 0 || selectedSplitMembers.length === 0) return;

    addGroupExpense({
      title: groupTitle.trim(),
      amount: Number(groupAmount),
      paid_by: groupPayer,
      split_between: selectedSplitMembers,
      date: new Date().toISOString().split('T')[0],
      settled: false,
    });

    setGroupTitle('');
    setGroupAmount(3000);
    setShowAddForm(false);
  };

  const unsettledBalances = settlementBalances.filter((b) => !b.settled);
  const settledBalances = settlementBalances.filter((b) => b.settled);

  const totalUnsettled = unsettledBalances.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('budget.group_splitter_badge', 'SHARED EXPENSE SPLITTER')}</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#0B1220] tracking-tight">
            {t('budget.group_splitter_title', 'Group Expense Splitting & Settlements')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('budget.group_splitter_sub', 'Automatic accounting for shared meals, cab rides, and group activities with transparent settlement ledger.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-xs !py-2.5 px-4 font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? t('action.cancel', 'Cancel') : t('budget.split_group_bill', '+ Split Group Bill')}</span>
        </button>
      </div>

      {/* Inline Add Group Bill Form */}
      {showAddForm && (
        <form onSubmit={handleAddGroupExpense} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-fade-in">
          <h4 className="font-bold text-sm text-[#0B1220]">Record New Group Shared Bill</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Bill Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Goa Beach Shack Lunch"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Bill (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={groupAmount || ''}
                onChange={(e) => setGroupAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Who Paid?</label>
              <select
                value={groupPayer}
                onChange={(e) => setGroupPayer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              >
                {sharedMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Split Between ({selectedSplitMembers.length} members • ₹{selectedSplitMembers.length > 0 ? Math.round(groupAmount / selectedSplitMembers.length) : 0}/person):
            </label>
            <div className="flex flex-wrap gap-2">
              {['Sohan', 'Rahul', 'Priya', 'Ananya'].map((name) => {
                const isSelected = selectedSplitMembers.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleSplitMember(name)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                      isSelected
                        ? 'bg-[#0B1220] text-white border-[#0B1220]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs !py-2 px-5 font-bold rounded-xl shadow-xs"
            >
              Save & Calculate Split
            </button>
          </div>
        </form>
      )}

      {/* Settlement Balance Cards Matrix ("Who Paid / Who Owes") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Settlement Matrix</span>
          </h4>
          <span className="text-xs font-bold text-slate-500">
            Unsettled Total: <CurrencyDisplay amount={totalUnsettled} className="text-emerald-700 font-black" />
          </span>
        </div>

        {settlementBalances.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-1">
            <p className="text-xs font-bold text-slate-600">All balances are settled or no shared bills recorded yet.</p>
            <p className="text-[11px] text-slate-400">Add a shared bill or log multi-person expenses to calculate settlements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settlementBalances.map((b, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  b.settled
                    ? 'bg-slate-50/60 border-slate-200 opacity-70'
                    : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span className="text-indigo-700">{b.fromMember}</span>
                    <span className="text-slate-400">owes</span>
                    <span className="text-emerald-700">{b.toMember}</span>
                  </div>
                  {b.expenseTitle && (
                    <span className="text-[10.5px] text-slate-500 block truncate max-w-[200px]">
                      For: {b.expenseTitle}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded inline-block ${
                    b.settled ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {b.settled ? 'Settled ✓' : 'Unsettled'}
                  </span>
                </div>

                <div className="text-right flex items-center gap-3">
                  <CurrencyDisplay amount={b.amount} className="text-sm font-black text-slate-900" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recorded Group Bills Log */}
      {groupExpenses.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Group Bills Logged ({groupExpenses.length})</h4>
          <div className="space-y-2">
            {groupExpenses.map((ge) => (
              <div
                key={ge.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{ge.title}</span>
                  <span className="text-[11px] text-slate-500">
                    Paid by {ge.paid_by} • Split among {ge.split_between.join(', ')} ({ge.date})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CurrencyDisplay amount={ge.amount} className="font-black text-slate-800" />
                  <button
                    type="button"
                    onClick={() => settleGroupExpense(ge.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors ${
                      ge.settled
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {ge.settled ? 'Settled ✓' : 'Mark Settled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
