import React, { useState } from 'react';
import {
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrencyAmount } from '../../utils/currencyUtils';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const CurrencyConverterCard: React.FC = () => {
  const { t } = useTravelSettings();
  const [amount, setAmount] = useState<number>(50000);
  const [fromCurrency, setFromCurrency] = useState<string>('INR');
  const [toCurrency, setToCurrency] = useState<string>('USD');

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const convertedResult = convertCurrency(amount, fromCurrency, toCurrency);

  const fromCurrObj = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency);
  const toCurrObj = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency);

  // Single unit rate
  const singleUnitRate = convertCurrency(1, fromCurrency, toCurrency);

  return (
    <div className="surface-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-3 h-3 text-blue-600" />
            <span>{t('currency.badge', 'GLOBAL CURRENCY CONVERTER')}</span>
          </div>
          <h3 className="font-editorial text-xl font-bold text-[#0B1220] tracking-tight">
            {t('currency.title', 'Live Multi-Currency Calculator')}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{t('currency.reference_rates', 'Standard Reference Rates')}</span>
        </div>
      </div>

      {/* Inputs & Conversion Row */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
        {/* From Amount & Currency */}
        <div className="sm:col-span-3 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 block">{t('currency.you_pay', 'You Pay / Send')}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black font-mono focus:ring-2 focus:ring-[#0B1220]"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="sm:col-span-1 flex items-center justify-center pt-4 sm:pt-4">
          <button
            type="button"
            onClick={handleSwap}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#0B1220] hover:text-white text-slate-600 flex items-center justify-center transition-all shadow-xs"
            title="Swap Currencies"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Result & Currency */}
        <div className="sm:col-span-3 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 block">Converted Estimation</label>
          <div className="flex items-center gap-2">
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black font-mono text-[#0B1220]">
              {formatCurrencyAmount(convertedResult, toCurrency)}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exchange Rate Badge & Quick Multipliers */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-bold">Exchange Rate:</span>
          <span className="font-mono font-black text-indigo-700">
            1 {fromCurrency} = {singleUnitRate.toFixed(4)} {toCurrency}
          </span>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
          {[5000, 20000, 50000, 100000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className="text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold hover:border-slate-300"
            >
              ₹{(val / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
