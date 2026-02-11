import { ProjectStatus, STATUS_LABELS } from '@/types/project';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
