import React from 'react';

interface LivePresencePulseBadgeProps {
  status?: 'online' | 'offline' | 'in_consultation' | 'emergency' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelText?: string;
  className?: string;
}

export const LivePresencePulseBadge: React.FC<LivePresencePulseBadgeProps> = ({
  status = 'online',
  size = 'md',
  showLabel = false,
  labelText,
  className = '',
}) => {
  const isOnline = status === 'online';
  const isEmergency = status === 'emergency';
  const isInConsultation = status === 'in_consultation';

  // Dimension mapping
  const sizeClasses = {
    xs: { dot: 'w-2 h-2', ring: 'w-3.5 h-3.5', text: 'text-[10px]' },
    sm: { dot: 'w-2.5 h-2.5', ring: 'w-4 h-4', text: 'text-xs' },
    md: { dot: 'w-3 h-3', ring: 'w-5 h-5', text: 'text-xs' },
    lg: { dot: 'w-4 h-4', ring: 'w-6 h-6', text: 'text-sm' },
  }[size];

  // Color mapping
  let bgDot = 'bg-slate-400 dark:bg-slate-500';
  let defaultLabel = 'Offline';
  let labelColor = 'text-slate-500 dark:text-slate-400';

  if (isEmergency) {
    bgDot = 'bg-rose-500 shadow-rose-500/50';
    defaultLabel = 'Emergency SOS';
    labelColor = 'text-rose-600 dark:text-rose-400 font-bold';
  } else if (isInConsultation) {
    bgDot = 'bg-amber-500 shadow-amber-500/50';
    defaultLabel = 'In Call';
    labelColor = 'text-amber-600 dark:text-amber-400';
  } else if (isOnline) {
    bgDot = 'bg-emerald-500 shadow-emerald-500/50';
    defaultLabel = 'Live Active';
    labelColor = 'text-emerald-600 dark:text-emerald-400 font-semibold';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex items-center justify-center">
        {isOnline && (
          <>
            {/* Outermost expanding sonar ripple */}
            <span
              className={`absolute ${sizeClasses.ring} rounded-full bg-emerald-400/40 animate-ping pointer-events-none`}
            />
            {/* Secondary soft pulsing halo */}
            <span
              className={`absolute inset-[-3px] rounded-full bg-emerald-500/30 animate-pulse pointer-events-none`}
            />
          </>
        )}

        {isEmergency && (
          <>
            <span
              className={`absolute ${sizeClasses.ring} rounded-full bg-rose-500/60 animate-ping pointer-events-none`}
            />
            <span
              className={`absolute inset-[-4px] rounded-full bg-rose-500/40 animate-pulse pointer-events-none`}
            />
          </>
        )}

        {/* Core solid dot */}
        <span
          className={`relative ${sizeClasses.dot} rounded-full ${bgDot} shadow-sm transition-colors duration-300`}
        />
      </span>

      {showLabel && (
        <span className={`${sizeClasses.text} ${labelColor} leading-none tracking-tight whitespace-nowrap`}>
          {labelText || defaultLabel}
        </span>
      )}
    </div>
  );
};
