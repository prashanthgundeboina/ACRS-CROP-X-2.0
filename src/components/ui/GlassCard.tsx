import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'emerald' | 'amber' | 'sky' | 'rose';
  hoverEffect?: boolean;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'light',
  hoverEffect = true,
  clickable = false,
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    light: 'bg-white/85 backdrop-blur-md border-[#c8e6c9]/60 text-[#1b2e1b] shadow-sm hover:shadow-md hover:border-[#4CAF50]/50',
    dark: 'bg-[#1b2e1b]/90 backdrop-blur-md border-[#2e7d32]/60 text-white shadow-lg hover:border-[#4CAF50]',
    emerald: 'bg-emerald-900/90 backdrop-blur-md border-emerald-500/40 text-white shadow-md',
    amber: 'bg-amber-900/90 backdrop-blur-md border-amber-500/40 text-white shadow-md',
    sky: 'bg-sky-900/90 backdrop-blur-md border-sky-500/40 text-white shadow-md',
    rose: 'bg-rose-900/90 backdrop-blur-md border-rose-500/40 text-white shadow-md',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      className={`rounded-3xl border transition-all duration-200 ${paddingStyles[padding]} ${variantStyles[variant]} ${
        clickable ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
