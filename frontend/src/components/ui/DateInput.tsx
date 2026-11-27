'use client';

import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Calendar } from 'lucide-react';

export interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  minDate?: string;
  maxDate?: string;
  hideLabel?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      error,
      helperText,
      minDate,
      maxDate,
      min,
      max,
      hideLabel = false,
      id,
      required,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const dateId = id || `date-${generatedId}`;
    const errorId = `${dateId}-error`;
    const helperId = `${dateId}-helper`;

    return (
      <div className="w-full">
        <label
          htmlFor={dateId}
          className={
            hideLabel
              ? 'sr-only'
              : 'block text-sm font-medium text-zinc-800 mb-1.5'
          }
        >
          {label}
          {required && (
            <span className="text-rose-600 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative flex items-center">
          <Calendar
            className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            ref={ref}
            id={dateId}
            type="date"
            min={minDate ?? min}
            max={maxDate ?? max}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={[
              'w-full h-10 rounded-lg border bg-white pl-9 pr-3 text-sm text-zinc-900 font-mono tabular-nums transition-[border-color,box-shadow] duration-150 ease-ease',
              'focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700',
              'disabled:bg-surface-subtle disabled:text-zinc-500 disabled:cursor-not-allowed',
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-zinc-900/15 hover:border-zinc-900/25',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-700 font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-zinc-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
export default DateInput;
