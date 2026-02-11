'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Project, ProjectStatus } from '@/types/project';
import { StatusBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, Calendar, User, DollarSign, Clock, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    setUpdating(true);
    try {
      const response = await api.patch(`/projects/${project._id}/status`, { status: newStatus });
      setProject(response.data);
      setError('');
    } catch (err: any) {
       setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${project._id}`);
      router.push('/');
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-20 text-gray-500">{error || 'Project not found'}</div>;

  const currentStatus = project.status;
  const validTransitions: ProjectStatus[] = [];
  if (currentStatus === 'active') validTransitions.push('on_hold', 'completed');
  if (currentStatus === 'on_hold') validTransitions.push('active', 'completed');

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-gray-400 font-mono">ID: {project._id}</p>
          </div>
          
          <div className="flex items-center gap-3">
             {validTransitions.length > 0 && (
                <div className="flex gap-2">
                   {validTransitions.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updating}
                        className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border",
                           status === 'active' ? "bg-white text-emerald-700 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50" :
                           status === 'on_hold' ? "bg-white text-amber-700 border-gray-200 hover:border-amber-200 hover:bg-amber-50" :
                           "bg-white text-blue-700 border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                        )}
                      >
                         {status === 'active' && <PlayCircle className="w-3.5 h-3.5" />}
                         {status === 'on_hold' && <PauseCircle className="w-3.5 h-3.5" />}
                         {status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                         Mark as {status.replace('_', ' ')}
                      </button>
                   ))}
                </div>
             )}

             <button 
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2 hover:bg-red-50 rounded-lg"
                title="Delete Project"
             >
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Main Info */}
           <div className="md:col-span-2 space-y-8">
              <div>
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Description</h3>
                 <div className="prose prose-sm prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
                 </div>
              </div>

               {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                     {error}
                  </div>
               )}
           </div>

           {/* Sidebar Info */}
           <div className="space-y-6">
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100 space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</label>
                    <div className="flex items-center gap-2 mt-1.5 text-gray-900 font-medium">
                        <User className="w-4 h-4 text-gray-400" />
                        {project.clientName}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline</label>
                    <div className="space-y-3 mt-1.5">
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Started: {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                        </div>
                        {project.endDate && (
                          <div className="flex items-center gap-2 text-gray-700 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>Due: {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {project.budget !== undefined && (
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</label>
                        <div className="flex items-center gap-2 mt-1.5 text-gray-900 font-medium">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.budget)}
                        </div>
                    </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
