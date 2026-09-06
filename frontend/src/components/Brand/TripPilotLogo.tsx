import React from 'react';
import logoImg from '../../assets/logo.png';

interface TripPilotLogoProps {
  size?: number;
  className?: string;
}

export const TripPilotLogo: React.FC<TripPilotLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <img
      src={logoImg}
      alt="TripPilot Logo"
      className={`object-contain flex-shrink-0 transition-transform duration-200 ease-out hover:scale-105 ${className}`}
      style={{ height: size, width: 'auto', maxHeight: size }}
      loading="eager"
    />
  );
};

export default TripPilotLogo;
