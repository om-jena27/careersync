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
      className={`backdrop-blur-xl bg-[#1a102f]/75 border border-violet-500/25 shadow-lg shadow-purple-950/40 rounded-2xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-pink-500/40 hover:bg-[#23153e]/80 hover:shadow-violet-900/30 hover:scale-[1.01]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
