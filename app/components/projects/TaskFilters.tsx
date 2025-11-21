import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TaskFiltersProps } from '@/app/types';

export default function TaskFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  showStatusDropdown,
  setShowStatusDropdown,
  showPriorityDropdown,
  setShowPriorityDropdown,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      {/* SearchBar */}
      <div className="flex-grow">
        <div className="flex w-full h-12 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center px-4 bg-gray-800/50 backdrop-blur-sm border border-r-0 border-gray-700/50 text-gray-400">
            <Search size={20} />
          </div>
          <input
            className="flex-1 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white placeholder:text-gray-400 focus:outline-none"
            placeholder="Search by task title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-800/50 backdrop-blur-sm px-4 border border-gray-700/50 hover:bg-gray-700/50 text-white"
          >
            <p className="text-sm font-medium">Status: {statusFilter}</p>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-10 min-w-[150px]">
              {['All', 'Pending', 'In Progress', 'Done'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-800/50 backdrop-blur-sm px-4 border border-gray-700/50 hover:bg-gray-700/50 text-white"
          >
            <p className="text-sm font-medium">Priority: {priorityFilter}</p>
            <ChevronDown size={16} />
          </button>
          {showPriorityDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-10 min-w-[150px]">
              {['All', 'Low', 'Medium', 'High'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    setPriorityFilter(priority);
                    setShowPriorityDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
