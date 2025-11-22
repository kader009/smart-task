'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Check, Search } from 'lucide-react';
import { Project } from '@/app/types';

interface ProjectDropdownProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export default function ProjectDropdown({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 border border-gray-700/50 rounded-lg hover:bg-gray-800 transition-colors min-w-[200px]"
      >
        <FolderOpen size={16} className="text-indigo-400" />
        <span className="flex-1 text-left text-white text-sm truncate">
          {selectedProject?.name || 'Select Project'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-800">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2 top-2.5 text-gray-500"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No projects found
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isSelected = selectedProject?._id === project._id;
                return (
                  <button
                    key={project._id}
                    onClick={() => {
                      onSelectProject(project);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <FolderOpen
                      size={14}
                      className={
                        isSelected ? 'text-indigo-400' : 'text-gray-500'
                      }
                    />
                    <span className="flex-1 truncate">{project.name}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
