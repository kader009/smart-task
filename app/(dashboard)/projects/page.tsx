'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, Wand2 } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

interface Project {
  _id: string;
  name: string;
  description: string;
  teamId: { _id: string; name: string } | string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Done';
  assignedTo: { _id: string; name: string } | null;
  projectId: { _id: string; name: string } | string;
}

interface Team {
  _id: string;
  name: string;
}

interface Member {
  _id: string;
  name: string;
  capacity: number;
  currentTasks?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Forms
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamId: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'Pending',
    assignedTo: '',
  });

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Warnings
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject._id);
      const teamId =
        typeof selectedProject.teamId === 'object'
          ? selectedProject.teamId._id
          : selectedProject.teamId;
      fetchMembers(teamId);
    } else {
      setTasks([]);
      setMembers([]);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const fetchTeams = async () => {
    const res = await fetch('/api/teams');
    if (res.ok) setTeams(await res.json());
  };

  const fetchTasks = async (projectId: string) => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    if (res.ok) {
      const tasksData = await res.json();
      console.log('=== FETCHED TASKS DEBUG ===');
      console.log('Tasks count:', tasksData.length);
      console.log('Full tasks data:', tasksData);
      if (tasksData.length > 0) {
        console.log('First task:', tasksData[0]);
        console.log('First task _id:', tasksData[0]._id);
        console.log('First task _id type:', typeof tasksData[0]._id);
        console.log('First task keys:', Object.keys(tasksData[0]));
      }
      console.log('=========================');
      setTasks(tasksData);
    }
  };

  const fetchMembers = async (teamId: string) => {
    const res = await fetch(`/api/teams/${teamId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects([...projects, project]);
        setSelectedProject(project);
        setShowProjectModal(false);
        setNewProject({ name: '', description: '', teamId: '' });
        toast.success('Project created successfully!', {
          description: `${project.name} has been added to your projects.`,
        });
      } else {
        toast.error('Failed to create project', {
          description: 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error('Something went wrong', {
        description: 'Unable to create project.',
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          projectId: selectedProject._id,
          assignedTo: newTask.assignedTo || null,
        }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks([...tasks, task]);
        setShowTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'Low',
          status: 'Pending',
          assignedTo: '',
        });
        setCapacityWarning(null);
        toast.success('Task created successfully!', {
          description: `${task.title} has been added to the project.`,
        });
      } else {
        toast.error('Failed to create task', {
          description: 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Failed to create task', error);
      toast.error('Something went wrong', {
        description: 'Unable to create task.',
      });
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('Editing task:', task);
    console.log('Task _id:', task._id);
    console.log('Task _id type:', typeof task._id);
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    // Get the task ID - handle both _id and id fields
    const taskId = editingTask._id || (editingTask as any).id;

    if (!taskId) {
      console.error('No task ID found!', editingTask);
      toast.error('Invalid task', {
        description: 'Task ID is missing.',
      });
      return;
    }

    try {
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        assignedTo:
          typeof editingTask.assignedTo === 'object' && editingTask.assignedTo
            ? editingTask.assignedTo._id
            : editingTask.assignedTo,
      };

      console.log('Updating task with payload:', payload);
      console.log('Task ID:', taskId);

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const responseData = await res.json();
      console.log('Response data:', responseData);

      if (res.ok) {
        setTasks(
          tasks.map((t) => (t._id === responseData._id ? responseData : t))
        );
        setShowEditTaskModal(false);
        setEditingTask(null);
        setCapacityWarning(null);
        toast.success('Task updated successfully!', {
          description: `${responseData.title} has been updated.`,
        });
      } else {
        toast.error('Failed to update task', {
          description: responseData.error || 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Something went wrong', {
        description: 'Unable to update task.',
      });
    }
  };

  const checkCapacity = (memberId: string) => {
    const member = members.find((m) => m._id === memberId);
    if (!member) return;

    const currentProjectTasks = tasks.filter(
      (t) =>
        t.assignedTo && t.assignedTo._id === memberId && t.status !== 'Done'
    ).length;

    if (currentProjectTasks >= member.capacity) {
      setCapacityWarning(
        `${member.name} has ${currentProjectTasks} tasks in this project (Capacity: ${member.capacity}). Assign anyway?`
      );
    } else {
      setCapacityWarning(null);
    }
  };

  const handleAutoAssign = () => {
    if (members.length === 0) return;
    const memberCounts = members.map((m) => {
      const count = tasks.filter(
        (t) => t.assignedTo && t.assignedTo._id === m._id && t.status !== 'Done'
      ).length;
      return { id: m._id, count, capacity: m.capacity };
    });
    memberCounts.sort((a, b) => {
      if (a.count === b.count) return b.capacity - a.capacity;
      return a.count - b.count;
    });
    const bestMember = memberCounts[0];
    setNewTask({ ...newTask, assignedTo: bestMember.id });
    checkCapacity(bestMember.id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesMember =
      memberFilter === 'All' ||
      (task.assignedTo && task.assignedTo._id === memberFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesMember;
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-bold tracking-tight">
              Manage Tasks
            </h1>
            <p className="text-gray-400 text-base font-normal leading-normal">
              Add, edit, and track all project tasks from here.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white text-sm font-bold leading-normal hover:bg-gray-700/50 transition-all"
            >
              <Plus size={16} />
              <span className="truncate">New Project</span>
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white text-sm font-bold leading-normal hover:bg-gray-700/50 transition-all"
            >
              <Plus size={16} />
              <span className="truncate">Add New Task</span>
            </button>
            <button
              onClick={handleAutoAssign}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white text-sm font-bold leading-normal hover:bg-gray-700/50 transition-all"
            >
              <Wand2 size={16} />
              <span className="truncate">Auto-assign</span>
            </button>
          </div>
        </div>

        <div>
          {/* Task List */}
          <div>
            {/* Search and Filters */}
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
                    <p className="text-sm font-medium">
                      Status: {statusFilter}
                    </p>
                    <ChevronDown size={16} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-10 min-w-[150px]">
                      {['All', 'Pending', 'In Progress', 'Done'].map(
                        (status) => (
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
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowPriorityDropdown(!showPriorityDropdown)
                    }
                    className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-800/50 backdrop-blur-sm px-4 border border-gray-700/50 hover:bg-gray-700/50 text-white"
                  >
                    <p className="text-sm font-medium">
                      Priority: {priorityFilter}
                    </p>
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

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/5">
                      Task Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white font-semibold text-xs">
                            {task.assignedTo
                              ? task.assignedTo.name.charAt(0).toUpperCase()
                              : 'U'}
                          </div>
                          <span className="text-sm text-gray-300">
                            {task.assignedTo
                              ? task.assignedTo.name
                              : 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            task.priority === 'High'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : task.priority === 'Medium'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          )}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            task.status === 'Done'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : task.status === 'In Progress'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          )}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">
                Create New Project
              </h2>
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Team
                    </label>
                    <select
                      required
                      value={newProject.teamId}
                      onChange={(e) =>
                        setNewProject({ ...newProject, teamId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a team</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg hover:bg-gray-700/50 transition-all font-bold"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto my-8">
              <h2 className="text-xl font-bold mb-4 text-white">
                Add New Task
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white placeholder:text-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Design homepage"
                    type="text"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white placeholder:text-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a more detailed description..."
                    rows={4}
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Assign Member
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.assignedTo}
                    onChange={(e) => {
                      setNewTask({ ...newTask, assignedTo: e.target.value });
                      checkCapacity(e.target.value);
                    }}
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} (Cap: {member.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {capacityWarning && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300">
                    <p className="font-semibold mb-2">{capacityWarning}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, priority })}
                        className={clsx(
                          'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all',
                          newTask.priority === priority
                            ? 'border-2 border-indigo-500 bg-indigo-500/20 text-indigo-300'
                            : 'border border-gray-600 hover:bg-gray-700/50 text-gray-300'
                        )}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value as any })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      setCapacityWarning(null);
                    }}
                    className="px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg hover:bg-gray-700/50 transition-all font-bold"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditTaskModal && editingTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto my-8">
              <h2 className="text-xl font-bold mb-4 text-white">Edit Task</h2>
              <form onSubmit={handleUpdateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white placeholder:text-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Design homepage"
                    type="text"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white placeholder:text-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a more detailed description..."
                    rows={4}
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Assign Member
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={
                      typeof editingTask.assignedTo === 'object' &&
                      editingTask.assignedTo
                        ? editingTask.assignedTo._id
                        : editingTask.assignedTo || ''
                    }
                    onChange={(e) => {
                      const memberId = e.target.value;
                      const member = members.find((m) => m._id === memberId);
                      setEditingTask({
                        ...editingTask,
                        assignedTo: member
                          ? { _id: member._id, name: member.name }
                          : null,
                      });
                      if (memberId) checkCapacity(memberId);
                    }}
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} (Cap: {member.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {capacityWarning && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300">
                    <p className="font-semibold mb-2">{capacityWarning}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() =>
                          setEditingTask({
                            ...editingTask,
                            priority: priority as any,
                          })
                        }
                        className={clsx(
                          'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all',
                          editingTask.priority === priority
                            ? 'border-2 border-indigo-500 bg-indigo-500/20 text-indigo-300'
                            : 'border border-gray-600 hover:bg-gray-700/50 text-gray-300'
                        )}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-700/50 bg-gray-700/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditTaskModal(false);
                      setEditingTask(null);
                      setCapacityWarning(null);
                    }}
                    className="px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg hover:bg-gray-700/50 transition-all font-bold"
                  >
                    Update Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
