'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Project, ProjectStatus } from '@/types/project';
import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { StatusBadge } from '@/components/StatusBadge';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { Search, ChevronDown, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';

export default function Home() {
  // State for storing project data
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Sort states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [sort, setSort] = useState('createdAt');
  
  // UI View toggles
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Debounce search input to avoid API spam (wait 300ms after typing stops)
  const [debouncedSearch] = useDebounce(search, 300);

  // Fetch projects from backend with filters applied
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters based on current state
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (sort) params.append('sort', sort);

      const response = await api.get(`/projects?${params.toString()}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, sort]);

  // Re-fetch users whenever filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
           <p className="text-gray-500 mt-1 text-base">
             Manage and track your ongoing projects, monitor status updates, and collaborate with your team.
           </p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onProjectCreated={(newProject) => {
           setProjects(prev => [newProject, ...prev]);
           // Optionally refetch to ensure sort order, but prepending is faster for UX
           fetchProjects(); 
        }}
      />

      {/* Toolbar Section */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center sticky top-20 z-10">
        {/* Search */}
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'grid' ? "bg-gray-100/50 text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'list' ? "bg-gray-100/50 text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block" />

          {/* Status Filter */}
          <div className="relative">
             <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus | '')}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-9 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 cursor-pointer hover:border-gray-300 transition-colors font-medium shadow-sm w-full md:w-auto"
             >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
             </select>
             <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
             <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-9 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 cursor-pointer hover:border-gray-300 transition-colors font-medium shadow-sm w-full md:w-auto"
             >
                <option value="createdAt">Newest First</option>
                <option value="startDate">Start Date (Asc)</option>
                <option value="-startDate">Start Date (Desc)</option>
             </select>
             <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
           <div className="relative">
             <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
           </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">No projects found</h3>
          <p className="text-gray-500 text-sm max-w-sm text-center mb-4">We couldn't find any projects matching your search criteria.</p>
          <button 
             onClick={() => {setSearch(''); setStatus('');}}
             className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
             Clear filters
          </button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {projects.map((project) => (
            viewMode === 'grid' ? (
              <ProjectCard key={project._id} project={project} />
            ) : (
              // Simple List View implementation (inline for now, could be a component)
              <Link href={`/projects/${project._id}`} key={project._id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-600`}>
                      {project.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.clientName}</p>
                  </div>
                </div>
                 {/* Hidden on small mobile */}
                <div className="hidden sm:block">
                   <StatusBadge status={project.status} />
                </div>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}
