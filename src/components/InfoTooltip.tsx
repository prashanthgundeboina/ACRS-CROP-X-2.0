import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { TooltipData } from '../data/parameterTooltips';

interface Props {
  paramKey: string;
}

export const InfoTooltip: React.FC<Props> = ({ paramKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = TooltipData.PARAMETERS[paramKey];

  if (!info) return null;

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#667e66] hover:text-[#2e7d32] transition-colors p-0.5 rounded-full focus:outline-none"
        aria-label={`Info about ${info.title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1b2e1b] text-white text-xs rounded-2xl shadow-2xl border border-[#2e7d32]/60 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#2e7d32]/40">
            <span className="font-serif font-bold text-[#81c784] text-xs">{info.title}</span>
            <span className="text-[9px] font-mono font-bold bg-[#2e7d32]/60 px-1.5 py-0.5 rounded text-white">{info.unit}</span>
          </div>
          <p className="text-[11px] text-gray-200 leading-relaxed mb-2">{info.description}</p>
          <div className="text-[10px] text-[#a5d6a7] font-semibold bg-[#122012] p-1.5 rounded-xl border border-[#2e7d32]/30">
            Optimum Target: <span className="text-white font-mono">{info.idealRange}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1b2e1b]" />
        </div>
      )}
    </div>
  );
};
