import React from 'react';

export interface Team {
  _id: string;
  name: string;
}

export interface Member {
  _id: string;
  name: string;
  role?: string;
  capacity: number;
  teamId?: string;
  currentTasks?: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  teamId: { _id: string; name: string } | string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Done';
  assignedTo: { _id: string; name: string } | null;
  projectId: { _id: string; name: string } | string;
}

export interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  recentLogs: any[];
  memberStats: any[];
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newProject: {
    name: string;
    description: string;
    teamId: string;
  };
  setNewProject: (project: {
    name: string;
    description: string;
    teamId: string;
  }) => void;
  teams: Team[];
}

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTask: {
    title: string;
    description: string;
    priority: string;
    status: string;
    assignedTo: string;
  };
  setNewTask: (task: any) => void;
  members: Member[];
  capacityWarning: string | null;
  checkCapacity: (memberId: string) => void;
}

export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingTask: Task;
  setEditingTask: (task: Task) => void;
  members: Member[];
  capacityWarning: string | null;
  checkCapacity: (memberId: string) => void;
}

export interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  showStatusDropdown: boolean;
  setShowStatusDropdown: (show: boolean) => void;
  showPriorityDropdown: boolean;
  setShowPriorityDropdown: (show: boolean) => void;
}

export interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}
