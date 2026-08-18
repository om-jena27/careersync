import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`backdrop-blur-md bg-white/70 border border-white/30 shadow-sm rounded-2xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:bg-white/80 hover:scale-[1.01]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
