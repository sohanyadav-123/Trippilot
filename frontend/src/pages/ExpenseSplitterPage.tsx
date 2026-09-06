import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Check, Trash2, Users } from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';

export const ExpenseSplitterPage: React.FC = () => {
  const { destination, groupExpenses, addGroupExpense, settleGroupExpense, sharedMembers } = useTripBuilder();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidBy, setPaidBy] = useState<string>(sharedMembers[0]?.name || 'Sohan');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addGroupExpense({
      title: title.trim(),
      amount,
      paid_by: paidBy,
      split_between: sharedMembers.map((m) => m.name),
      date: new Date().toISOString().split('T')[0],
      settled: false,
    });

    setTitle('');
    setAmount(0);
  };

  const totalGroupSpend = groupExpenses.reduce((acc, e) => acc + e.amount, 0);
  const unsettledTotal = groupExpenses.filter((e) => !e.settled).reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="surface-card p-8 rounded-3xl bg-[#0B1220] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>GROUP EXPENSE SPLITTER</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">
              Split Expenses for {destination}
            </h1>
            <p className="text-xs text-slate-300">
              Log shared dinners, cabs, or activity fees. TripPilot automatically calculates individual balances.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-center space-y-1 min-w-[180px]">
            <span className="text-slate-300 font-bold uppercase text-[10px] block">Unsettled Group Total</span>
            <CurrencyDisplay amount={unsettledTotal} className="font-black text-xl text-[#C8A96B]" />
          </div>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleAdd} className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-base text-[#0B1220]">Log New Group Expense</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Expense Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Seafood Dinner at Fisherman's Wharf"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Amount (₹)</label>
              <input
                type="number"
                min={1}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-field text-xs py-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="input-field text-xs py-2 font-bold"
              >
                {sharedMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </motion.button>
          </div>
        </form>

        {/* Expenses List */}
        <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-base text-[#0B1220] pb-2 border-b border-slate-100 flex justify-between">
            <span>Group Expenses Log ({groupExpenses.length})</span>
            <span className="text-slate-400 font-normal">Total Spent: ₹{totalGroupSpend.toLocaleString('en-IN')}</span>
          </h3>

          {groupExpenses.length === 0 ? (
            <p className="text-slate-400 text-center py-6">No group expenses logged yet.</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {groupExpenses.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      e.settled ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{e.title}</h4>
                      <span className="text-xs text-slate-500">
                        Paid by <span className="font-bold text-slate-800">{e.paid_by}</span> • Split between {e.split_between.length} members
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <CurrencyDisplay amount={e.amount} className="font-black text-sm text-slate-900" />
                      {!e.settled ? (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => settleGroupExpense(e.id)}
                          className="btn-secondary text-[11px] !py-1 px-3 font-bold"
                        >
                          Mark Settled
                        </motion.button>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                          Settled ✓
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
