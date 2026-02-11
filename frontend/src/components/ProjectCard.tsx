import Link from 'next/link';
import { format } from 'date-fns';
import { Project } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Generate a consistent color for the avatar based on the client name
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Link 
      href={`/projects/${project._id}`} 
      className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all duration-300 flex flex-col h-full"
    >
      {/* Header with Badge */}
      <div className="flex justify-between items-start mb-4">
        <StatusBadge status={project.status} />
      </div>
      
      {/* Title & Description */}
      <div className="mb-6 flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer / Meta Data */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(project.clientName)}`}>
            {project.clientName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-600">{project.clientName}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-gray-400 border border-gray-100 px-2.5 py-1 rounded-md shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Link>
  );
}
