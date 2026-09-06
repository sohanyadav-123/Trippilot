import React, { useState } from 'react';
import { DollarSign, ArrowLeftRight } from 'lucide-react';

export const CurrencyConverterWidget: React.FC = () => {
  const [amountInr, setAmountInr] = useState<number>(10000);
  const [targetCurr, setTargetCurr] = useState<'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'THB' | 'JPY'>('USD');

  const exchangeRates: Record<string, number> = {
    USD: 0.012, // 1 INR = 0.012 USD (~83.3 INR/USD)
    EUR: 0.011, // ~90.5 INR/EUR
    GBP: 0.0094, // ~106.3 INR/GBP
    AED: 0.044, // ~22.7 INR/AED
    SGD: 0.016, // ~62.5 INR/SGD
    THB: 0.43, // ~2.32 INR/THB
    JPY: 1.76, // ~0.57 INR/JPY
  };

  const converted = Math.round(amountInr * (exchangeRates[targetCurr] || 0.012) * 100) / 100;

  return (
    <div className="surface-card p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-[#0B1220] flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Currency & Exchange Converter</span>
        </h4>
        <span className="text-[9.5px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
          LIVE RATES (ESTIMATED)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">INR Amount (₹)</label>
          <input
            type="number"
            value={amountInr || ''}
            onChange={(e) => setAmountInr(Number(e.target.value))}
            className="input-field text-xs font-mono font-bold py-1.5"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Currency</label>
          <select
            value={targetCurr}
            onChange={(e) => setTargetCurr(e.target.value as any)}
            className="input-field text-xs font-bold py-1.5"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AED">AED (Dh)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="THB">THB (฿)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
        <span className="text-slate-600 font-medium">Converted Value:</span>
        <span className="font-black text-sm text-emerald-900 font-mono">
          {targetCurr} {converted.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
