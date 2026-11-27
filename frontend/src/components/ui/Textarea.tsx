'use client';

import React, { TextareaHTMLAttributes, forwardRef, useId } from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  rows?: number;
  hideLabel?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      rows = 4,
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
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full">
        <label
          htmlFor={textareaId}
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
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={[
            'w-full rounded-lg border bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-[border-color,box-shadow] duration-150 ease-ease',
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

Textarea.displayName = 'Textarea';
export default Textarea;
