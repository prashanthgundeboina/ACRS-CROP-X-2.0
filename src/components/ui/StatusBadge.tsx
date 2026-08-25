import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, type LucideIcon } from 'lucide-react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon: CustomIcon,
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const variantStyles: Record<StatusVariant, { bg: string; icon: LucideIcon }> = {
    success: {
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/80',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-100 text-amber-900 border-amber-300/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/80',
      icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-rose-100 text-rose-900 border-rose-300/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/80',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-sky-100 text-sky-900 border-sky-300/80 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700/80',
      icon: Info,
    },
    neutral: {
      bg: 'bg-gray-100 text-gray-800 border-gray-300/80 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
      icon: Info,
    },
  };

  const currentVariant = variantStyles[variant];
  const IconComponent = CustomIcon || currentVariant.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs font-mono uppercase tracking-wider ${sizeStyles[size]} ${currentVariant.bg} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      <IconComponent className={`${iconSizes[size]} shrink-0`} />
      <span>{label}</span>
    </span>
  );
};
