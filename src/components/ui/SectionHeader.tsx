import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionElement?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actionElement,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-2 bg-[#e8f5e9] text-[#2e7d32] rounded-xl shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 font-sans mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionElement && <div className="shrink-0">{actionElement}</div>}
    </div>
  );
};
