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
              : 'block text-sm font-medium text-slate-700 mb-1.5'
          }
        >
          {label}
          {required && (
            <span className="text-rose-600 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative flex items-center">
          <Calendar
            className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
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
              'w-full h-10 rounded-lg border bg-white pl-9 pr-3.5 text-sm text-slate-900 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600',
              'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
              error
                ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 hover:border-slate-400',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-600 font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
export default DateInput;
