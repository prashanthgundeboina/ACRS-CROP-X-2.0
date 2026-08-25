import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusBadge, StatusVariant } from './StatusBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  statusBadge?: {
    label: string;
    variant: StatusVariant;
  };
  technicalDetail?: string;
  isExpertMode?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  iconColor = 'text-[#2e7d32]',
  statusBadge,
  technicalDetail,
  isExpertMode = false,
  onClick,
  className = '',
}) => {
  return (
    <GlassCard
      clickable={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">
            {title}
          </span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b2e1b]">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-gray-600">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 bg-[#e8f5e9] rounded-2xl shrink-0 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-xs">
        {subtitle && <p className="text-gray-600 font-medium leading-tight">{subtitle}</p>}

        {statusBadge && (
          <StatusBadge
            label={statusBadge.label}
            variant={statusBadge.variant}
            size="sm"
          />
        )}
      </div>

      {isExpertMode && technicalDetail && (
        <div className="mt-2 p-2 bg-[#1b2e1b]/5 rounded-xl border border-[#2e7d32]/20 font-mono text-[10px] text-emerald-900 leading-tight">
          <span className="font-bold uppercase text-[9px] text-[#2e7d32] block">
            Agronomic Telemetry
          </span>
          {technicalDetail}
        </div>
      )}
    </GlassCard>
  );
};
