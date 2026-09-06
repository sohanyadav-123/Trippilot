import React from 'react';

/**
 * TripPilot Professional SVG Logo – refined design with premium glow and animation
 *
 * Features:
 *   • Radial gradient for the navy background (deep navy to slightly lighter for depth)
 *   • Gold gradient for compass pointers and decorative rings
 *   • Subtle drop‑shadow filter for a lifted feel and outer glow
 *   • Additional inner subtle gradient circle for richness
 *   • Hover animation (scale & slight rotation) via CSS class
 */

interface TripPilotLogoProps {
  size?: number;
  className?: string;
}

export const TripPilotLogo: React.FC<TripPilotLogoProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="TripPilot logo"
    className={`flex-shrink-0 transition-transform duration-200 ease-out hover:scale-105 hover:rotate-2 logo-spin ${className}`}
  >
    {/* Define gradients and shadow filter */}
    <defs>
      <radialGradient id="bgGrad" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#0B1220" />
        <stop offset="100%" stopColor="#1A2335" />
      </radialGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C8A96B" />
        <stop offset="100%" stopColor="#D9B97E" />
      </linearGradient>
      {/* Soft outer glow */}
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background circle – navy with gradient and subtle shadow */}
    <circle cx="32" cy="32" r="30" fill="url(#bgGrad)" filter="url(#glow)" />

    {/* Outer ring – delicate gold gradient with animation */}
    <circle cx="32" cy="32" r="28" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" className="outer-ring" opacity="0.6" />

    {/* Inner subtle gradient circle */}
    <circle cx="32" cy="32" r="12" fill="url(#goldGrad)" opacity="0.15" />

    {/* Compass rose – four pointers using gold gradient with varying opacity for depth */}
    <path d="M32 12 L36 30 L32 28 L28 30 Z" fill="url(#goldGrad)" />
    <path d="M32 52 L28 34 L32 36 L36 34 Z" fill="url(#goldGrad)" opacity="0.45" />
    <path d="M52 32 L34 28 L36 32 L34 36 Z" fill="url(#goldGrad)" opacity="0.65" />
    <path d="M12 32 L30 36 L28 32 L30 28 Z" fill="url(#goldGrad)" opacity="0.45" />

    {/* Center accent – double dot for focus */}
    <circle cx="32" cy="32" r="3" fill="url(#goldGrad)" />
    <circle cx="32" cy="32" r="1.5" fill="#0B1220" />

    {/* Inner decorative ring – subtle gold stroke */}
    <circle cx="32" cy="32" r="8" stroke="url(#goldGrad)" strokeWidth="0.75" fill="none" opacity="0.3" />

    {/* Tick marks at 45° angles – fine gold lines */}
    <line x1="39" y1="18" x2="38" y2="21" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="46" y1="25" x2="43" y2="26" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="46" y1="39" x2="43" y2="38" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="39" y1="46" x2="38" y2="43" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="25" y1="46" x2="26" y2="43" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="18" y1="39" x2="21" y2="38" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="18" y1="25" x2="21" y2="26" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
    <line x1="25" y1="18" x2="26" y2="21" stroke="url(#goldGrad)" strokeWidth="0.75" opacity="0.4" />
  </svg>
);

export default TripPilotLogo;
