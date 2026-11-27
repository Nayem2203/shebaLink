'use client';

import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 border border-brand-950/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)]',
  secondary:
    'bg-surface-subtle text-zinc-900 hover:bg-zinc-200/80 active:bg-zinc-200 border border-zinc-900/10',
  outline:
    'bg-white text-zinc-800 hover:bg-surface-hover hover:text-zinc-950 active:bg-surface-subtle border border-zinc-900/15 shadow-[0_1px_2px_rgba(24,24,27,0.04)]',
  destructive:
    'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 border border-transparent shadow-[0_1px_2px_rgba(24,24,27,0.06)]',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-900/5 hover:text-zinc-900 active:bg-zinc-900/10 border border-transparent',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs font-medium rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm font-medium rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm font-medium rounded-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-ease active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className="w-4 h-4 animate-spin shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
