import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { type LucideIcon, Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'voice' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface FarmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export const FarmerButton: React.FC<FarmerButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-2xl gap-2 font-bold',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-bold',
    xl: 'px-8 py-4 text-lg rounded-3xl gap-3 font-extrabold',
  };

  const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-[#2e7d32] to-[#1b2e1b] text-white hover:from-[#388e3c] hover:to-[#2e7d32] shadow-md border border-[#4CAF50]/40',
    secondary:
      'bg-[#e8f5e9] text-[#1b2e1b] hover:bg-[#c8e6c9] border border-[#a5d6a7]',
    outline:
      'bg-white/80 text-[#1b2e1b] hover:bg-white border-2 border-[#2e7d32]/40 hover:border-[#2e7d32]',
    voice:
      'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white shadow-lg border border-amber-300/40 hover:brightness-110',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-md border border-rose-400/40',
    ghost:
      'bg-transparent text-[#1b2e1b] hover:bg-[#e8f5e9]/50 border border-transparent',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.01 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
        </>
      )}
    </motion.button>
  );
};
