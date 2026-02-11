export interface Project {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'on_hold' | 'completed';
  clientName: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = Project['status'];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};
