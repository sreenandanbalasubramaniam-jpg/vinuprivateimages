
import React from 'react';

interface StatusCardProps {
  children: React.ReactNode;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative z-10 p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl max-w-md w-full mx-4 transition-all duration-500 hover:bg-white/15 ${className}`}>
      {children}
    </div>
  );
};
