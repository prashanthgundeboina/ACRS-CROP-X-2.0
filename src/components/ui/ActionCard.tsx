import React from 'react';
import { type LucideIcon, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusBadge, StatusVariant } from './StatusBadge';
import { FarmerButton } from './FarmerButton';

interface ActionCardProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant: StatusVariant;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon,
  badge,
  severity = 'low',
  className = '',
}) => {
  const severityBorder = {
    low: 'border-emerald-200 bg-emerald-50/50',
    medium: 'border-amber-300 bg-amber-50/60',
    high: 'border-orange-400 bg-orange-50/70',
    critical: 'border-rose-500 bg-rose-50/80',
  };

  return (
    <GlassCard
      className={`relative overflow-hidden transition-all duration-200 border-2 ${severityBorder[severity]} ${className}`}
      padding="md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-3 bg-white rounded-2xl shadow-xs shrink-0 text-[#2e7d32]">
              <Icon className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#1b2e1b]">
                {title}
              </h4>
              {badge && (
                <StatusBadge label={badge.label} variant={badge.variant} size="sm" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-black/5 flex justify-end">
        <FarmerButton
          onClick={onAction}
          variant={severity === 'critical' || severity === 'high' ? 'danger' : 'primary'}
          size="sm"
          icon={ChevronRight}
          iconPosition="right"
        >
          {actionText}
        </FarmerButton>
      </div>
    </GlassCard>
  );
};
