import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  isRoundTrip?: boolean;
  onSelectDeparture: (date: string) => void;
  onSelectReturn?: (date: string) => void;
  flexibleDays?: number; // 0, 1, 2, 3
  onSelectFlexibleDays?: (days: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  isOpen,
  onClose,
  departureDate,
  returnDate,
  isRoundTrip = false,
  onSelectDeparture,
  onSelectReturn,
  flexibleDays = 0,
  onSelectFlexibleDays,
}) => {
  // Parse current departure date or default to today
  const initDate = departureDate ? new Date(departureDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initDate.getMonth()); // 0-11
  const [selectingTarget, setSelectingTarget] = useState<'departure' | 'return'>('departure');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dep = departureDate ? new Date(departureDate) : null;
  if (dep) dep.setHours(0, 0, 0, 0);

  const ret = returnDate ? new Date(returnDate) : null;
  if (ret) ret.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const formatDateStr = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    selected.setHours(0, 0, 0, 0);
    const dateStr = formatDateStr(year, month, day);

    if (!isRoundTrip) {
      onSelectDeparture(dateStr);
      onClose();
      return;
    }

    if (selectingTarget === 'departure') {
      onSelectDeparture(dateStr);
      if (ret && selected > ret) {
        // adjust return date forward
        if (onSelectReturn) onSelectReturn(dateStr);
      }
      setSelectingTarget('return');
    } else {
      if (dep && selected < dep) {
        // User picked return before departure -> set as departure
        onSelectDeparture(dateStr);
        setSelectingTarget('return');
      } else {
        if (onSelectReturn) onSelectReturn(dateStr);
        onClose();
      }
    }
  };

  const renderMonthCalendar = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      thisDate.setHours(0, 0, 0, 0);

      const isPast = thisDate < today;
      const isDep = dep && thisDate.getTime() === dep.getTime();
      const isRet = ret && thisDate.getTime() === ret.getTime();
      const inRange = isRoundTrip && dep && ret && thisDate > dep && thisDate < ret;
      const isToday = thisDate.getTime() === today.getTime();

      let btnClass = 'h-9 w-9 text-xs rounded-xl font-bold transition-all flex items-center justify-center relative ';

      if (isPast) {
        btnClass += 'text-slate-300 opacity-50 cursor-not-allowed';
      } else if (isDep || isRet) {
        btnClass += 'bg-slate-900 text-white font-extrabold shadow-sm scale-105 z-10';
      } else if (inRange) {
        btnClass += 'bg-blue-50 text-blue-700 font-semibold rounded-none';
      } else {
        btnClass += 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 cursor-pointer';
      }

      days.push(
        <button
          key={`day-${d}`}
          disabled={isPast}
          type="button"
          onClick={() => handleDateClick(year, month, d)}
          className={btnClass}
        >
          <span>{d}</span>
          {isToday && !isDep && !isRet && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>
      );
    }

    return (
      <div className="p-3">
        <div className="text-center font-black text-sm text-slate-900 mb-3">
          {MONTH_NAMES[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_SHORT.map((d) => (
            <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 460, damping: 32 }}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {isRoundTrip ? 'Select Travel Dates' : 'Select Departure Date'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isRoundTrip
                  ? selectingTarget === 'departure'
                    ? 'Pick departure date'
                    : 'Pick return date'
                  : 'Choose your outbound travel date'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Round Trip Stepper Header */}
        {isRoundTrip && (
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectingTarget('departure')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectingTarget === 'departure'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Departure: {departureDate || 'Select Date'}
              </button>
              <span className="text-slate-400">→</span>
              <button
                type="button"
                onClick={() => setSelectingTarget('return')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectingTarget === 'return'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Return: {returnDate || 'Select Date'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation bar */}
        <div className="flex items-center justify-between px-6 pt-3 bg-white">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600">
            {MONTH_NAMES[currentMonth]} {currentYear} — {MONTH_NAMES[nextMonth]} {nextMonthYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Calendar Month Grids */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          <div>{renderMonthCalendar(currentYear, currentMonth)}</div>
          <div className="pt-4 md:pt-0 md:pl-4">{renderMonthCalendar(nextMonthYear, nextMonth)}</div>
        </div>

        {/* Flexible Dates Toggle & Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onSelectFlexibleDays && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Flexible Dates:</span>
              {[
                { label: 'Exact', val: 0 },
                { label: '±1 Day', val: 1 },
                { label: '±2 Days', val: 2 },
                { label: '±3 Days', val: 3 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onSelectFlexibleDays(opt.val)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                    flexibleDays === opt.val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto btn-primary text-xs !py-2 px-6 font-bold shadow-sm"
          >
            Done
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
