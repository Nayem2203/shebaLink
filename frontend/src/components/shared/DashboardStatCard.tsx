import React, { ReactNode } from 'react';

export interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  helperText?: string;
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
}

export function DashboardStatCard({
  label,
  value,
  trend,
  helperText,
  className = '',
}: DashboardStatCardProps) {
  return (
    <div
      className={[
        'bg-white border border-zinc-900/10 rounded-xl p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04)] flex flex-col justify-between gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="text-2xl sm:text-3xl font-medium text-zinc-900 font-mono tabular-nums tracking-tight">
        {value}
      </p>
      {(trend || helperText) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className="font-medium text-emerald-700 font-mono tabular-nums">
              {trend}
            </span>
          )}
          {helperText && (
            <span className="text-zinc-500 truncate">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardStatCard;
