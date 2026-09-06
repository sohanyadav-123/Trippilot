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
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
          isDark
            ? 'bg-[#1E293B] border border-slate-700 shadow-inner'
            : 'bg-slate-200 border border-slate-300 shadow-inner'
        }`}
      >
        {/* Track Icons for visual richness */}
        <span className="absolute left-1.5 flex h-4 w-4 items-center justify-center text-amber-500 opacity-80 pointer-events-none transition-opacity duration-200">
          <Sun className="h-3 w-3" />
        </span>
        <span className="absolute right-1.5 flex h-4 w-4 items-center justify-center text-indigo-300 opacity-80 pointer-events-none transition-opacity duration-200">
          <Moon className="h-3 w-3" />
        </span>

        {/* Sliding Thumb */}
        <span
          className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full shadow-md transition-all duration-300 ease-spring ${
            isDark
              ? 'translate-x-6 bg-slate-900 text-amber-400 border border-slate-700'
              : 'translate-x-0.5 bg-white text-amber-500 border border-slate-200'
          }`}
        >
          {isDark ? (
            <Moon className="h-3 w-3 fill-amber-400 text-amber-400 transition-transform duration-200" />
          ) : (
            <Sun className="h-3 w-3 fill-amber-400 text-amber-500 transition-transform duration-200" />
          )}
        </span>
      </button>
    </div>
  );
};

export default ThemeToggleSwitch;
