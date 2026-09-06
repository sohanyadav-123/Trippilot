import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleSwitchProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  showLabel = false,
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showLabel ? (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      ) : (
        <Sun
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isDark ? 'text-slate-400 opacity-40 scale-90' : 'text-amber-500 opacity-100 scale-100'
          }`}
        />
      )}

      {/* ── Authentic iPhone / iOS-Style Pill Switch ── */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Toggle ${isDark ? 'light' : 'dark'} theme`}
        onClick={toggleTheme}
        className={`group relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
          isDark
            ? 'bg-[#34C759]' // Iconic iOS switch green
            : 'bg-[#E9E9EA] dark:bg-slate-700' // Authentic iOS inactive grey
        }`}
        style={{
          boxShadow: isDark
            ? 'inset 0 0 1px 1px rgba(0, 0, 0, 0.1)'
            : 'inset 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* iOS Pure White Circular Thumb with layered depth shadow & press stretch */}
        <span
          className={`pointer-events-none absolute left-[2px] top-[2px] h-[24px] w-[24px] rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.2,0.85,0.32,1.2)] group-active:w-[28px] ${
            isDark ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
          style={{
            boxShadow:
              '0 3px 8px 0 rgba(0, 0, 0, 0.15), 0 1px 1px 0 rgba(0, 0, 0, 0.06), 0 3px 1px 0 rgba(0, 0, 0, 0.1)',
          }}
        />
      </button>

      {!showLabel && (
        <Moon
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isDark ? 'text-indigo-400 opacity-100 scale-100' : 'text-slate-400 opacity-40 scale-90'
          }`}
        />
      )}
    </div>
  );
};

export default ThemeToggleSwitch;
