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

const iconVariantStyles: Record<
  NonNullable<DashboardStatCardProps['variant']>,
  string
> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-indigo-50 text-indigo-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
};

export function DashboardStatCard({
  label,
  value,
  icon,
  trend,
  helperText,
  variant = 'default',
  className = '',
}: DashboardStatCardProps) {
  return (
    <div
      className={[
        'bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
        {(trend || helperText) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
            {helperText && (
              <span className="text-slate-500 truncate">{helperText}</span>
            )}
          </div>
        )}
      </div>

      {icon && (
        <div
          className={[
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            iconVariantStyles[variant],
          ].join(' ')}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export default DashboardStatCard;
