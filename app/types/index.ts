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
