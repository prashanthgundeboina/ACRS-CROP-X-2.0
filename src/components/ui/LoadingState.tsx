import React from 'react';
import { Loader2, Sprout } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingStateProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing Agronomic Telemetry...',
  subtitle = 'Connecting with Google Gemini 2.5 AI & Open-Meteo Weather System',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-[#2e7d32]"
        />
        <Sprout className="w-7 h-7 text-[#2e7d32] absolute animate-bounce" />
      </div>

      <div className="space-y-1">
        <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">{message}</h3>
        {subtitle && <p className="text-xs text-gray-500 max-w-sm">{subtitle}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
