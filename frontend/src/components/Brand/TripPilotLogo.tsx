import React from 'react';

/**
 * TripPilot Professional SVG Logo
 *
 * A modern minimalist logo featuring a compass-rose / navigation pin motif.
 * Uses the brand palette: deep navy #0B1220 and gold accent #C8A96B.
 * Renders crisply at any resolution as a pure inline SVG.
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
    className={`flex-shrink-0 ${className}`}
  >
    {/* Background circle – deep navy */}
    <circle cx="32" cy="32" r="30" fill="#0B1220" />

    {/* Outer ring – subtle gold border */}
    <circle cx="32" cy="32" r="28" stroke="#C8A96B" strokeWidth="1.5" fill="none" opacity="0.5" />

    {/* Compass rose – 4 cardinal points */}
    {/* North pointer – gold filled */}
    <path
      d="M32 12 L36 30 L32 28 L28 30 Z"
      fill="#C8A96B"
    />
    {/* South pointer – lighter shade */}
    <path
      d="M32 52 L28 34 L32 36 L36 34 Z"
      fill="#C8A96B"
      opacity="0.45"
    />
    {/* East pointer – gold filled */}
    <path
      d="M52 32 L34 28 L36 32 L34 36 Z"
      fill="#C8A96B"
      opacity="0.65"
    />
    {/* West pointer – lighter shade */}
    <path
      d="M12 32 L30 36 L28 32 L30 28 Z"
      fill="#C8A96B"
      opacity="0.45"
    />

    {/* Center dot */}
    <circle cx="32" cy="32" r="3" fill="#C8A96B" />
    <circle cx="32" cy="32" r="1.5" fill="#0B1220" />

    {/* Inner decorative ring */}
    <circle cx="32" cy="32" r="8" stroke="#C8A96B" strokeWidth="0.75" fill="none" opacity="0.3" />

    {/* Tiny tick marks at 45° angles */}
    <line x1="39" y1="18" x2="38" y2="21" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="46" y1="25" x2="43" y2="26" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="46" y1="39" x2="43" y2="38" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="39" y1="46" x2="38" y2="43" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="25" y1="46" x2="26" y2="43" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="18" y1="39" x2="21" y2="38" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="18" y1="25" x2="21" y2="26" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
    <line x1="25" y1="18" x2="26" y2="21" stroke="#C8A96B" strokeWidth="0.75" opacity="0.4" />
  </svg>
);

export default TripPilotLogo;
