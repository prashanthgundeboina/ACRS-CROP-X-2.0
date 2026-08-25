import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';

interface SimpleExpertToggleProps {
  isExpertMode?: boolean;
  isExpert?: boolean;
  onToggle: (isExpert: boolean) => void;
  className?: string;
}

export const SimpleExpertToggle: React.FC<SimpleExpertToggleProps> = ({
  isExpertMode,
  isExpert,
  onToggle,
  className = '',
}) => {
  const activeMode = isExpertMode ?? isExpert ?? false;
  return (
    <div
      className={`inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-[#c8e6c9] shadow-xs ${className}`}
    >
      <button
        onClick={() => onToggle(false)}
        className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
          !activeMode ? 'text-[#1b2e1b]' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        {!activeMode && (
          <motion.div
            layoutId="toggleBg"
            className="absolute inset-0 bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl shadow-2xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Sparkles className="w-3.5 h-3.5 text-[#4CAF50] relative z-10" />
        <span className="relative z-10 font-sans">Simple Farmer</span>
      </button>

      <button
        onClick={() => onToggle(true)}
        className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
          activeMode ? 'text-white' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        {activeMode && (
          <motion.div
            layoutId="toggleBg"
            className="absolute inset-0 bg-[#1b2e1b] rounded-xl shadow-xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Activity className="w-3.5 h-3.5 text-emerald-400 relative z-10" />
        <span className="relative z-10 font-sans">Expert Agronomist</span>
      </button>
    </div>
  );
};
