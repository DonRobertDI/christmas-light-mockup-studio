import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="surface flex min-h-[340px] flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-pine-50 text-pine-700">
        <Icon className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-gold-300" />
      </div>
      <h2 className="mt-5 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
