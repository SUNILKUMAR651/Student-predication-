import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'amber' | 'red';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  trend,
}) => {
  const badgeClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  }[badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-blue-50 p-3 sm:p-3.5 text-blue-600 shadow-xs shrink-0">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {(badge || trend) && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs sm:text-sm">
          {badge && (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-bold ${badgeClasses}`}>
              {badge}
            </span>
          )}
          {trend && <span className="text-slate-400 font-medium">{trend}</span>}
        </div>
      )}
    </div>
  );
};
