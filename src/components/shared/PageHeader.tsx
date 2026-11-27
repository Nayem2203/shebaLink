import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={[
        'pb-6 border-b border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-1.5">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-indigo-700 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={isLast ? 'font-medium text-slate-800' : ''}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
