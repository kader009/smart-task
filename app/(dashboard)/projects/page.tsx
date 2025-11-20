'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  User as UserIcon,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';

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
  currentTasks?: number; // We might need to fetch this separately or calculate it
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamId: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: '',
  });

  // Warnings
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject._id);
      // Fetch members for the team of the selected project
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
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    const res = await fetch('/api/teams');
    if (res.ok) setTeams(await res.json());
  };

  const fetchTasks = async (projectId: string) => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    if (res.ok) setTasks(await res.json());
  };

  const fetchMembers = async (teamId: string) => {
    const res = await fetch(`/api/teams/${teamId}/members`);
    if (res.ok) {
      const data = await res.json();
      // For a real app, we should also fetch current load for each member to show capacity warnings correctly
      // For now, we will just store the members
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
      }
    } catch (error) {
      console.error('Failed to create project', error);
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
          priority: 'Medium',
          status: 'Pending',
          assignedTo: '',
        });
        setCapacityWarning(null);
      }
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const checkCapacity = (memberId: string) => {
    // This is a simplified client-side check.
    // Ideally, we should have the current load available.
    // We can count tasks currently in the 'tasks' state for this member,
    // but that only counts tasks in THIS project.
    // For a complete check, we need the backend to tell us or fetch all tasks.
    // For this demo, let's just check against the tasks we see here + assume 0 from others or fetch properly.

    // Let's just show the warning if we can find the member and they have many tasks in this list.
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Projects & Tasks
        </h1>
        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Projects
          </h2>
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => setSelectedProject(project)}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-lg transition-colors',
                selectedProject?._id === project._id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <div className="font-medium">{project.name}</div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {project.description}
              </div>
            </button>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-gray-500 italic">No projects yet.</p>
          )}
        </div>

        {/* Tasks Board */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedProject.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedProject.description}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter size={16} />
                    Filter
                  </button>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Pending', 'In Progress', 'Done'].map((status) => (
                  <div
                    key={status}
                    className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl"
                  >
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <span
                        className={clsx(
                          'w-2 h-2 rounded-full',
                          status === 'Pending'
                            ? 'bg-yellow-400'
                            : status === 'In Progress'
                            ? 'bg-blue-400'
                            : 'bg-green-400'
                        )}
                      />
                      {status}
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.status === status)
                        .map((task) => (
                          <div
                            key={task._id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={clsx(
                                  'text-xs px-2 py-1 rounded-full font-medium',
                                  task.priority === 'High'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : task.priority === 'Medium'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                )}
                              >
                                {task.priority}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    !confirm(
                                      'Are you sure you want to delete this task?'
                                    )
                                  )
                                    return;
                                  try {
                                    const res = await fetch(
                                      `/api/tasks?id=${task._id}`,
                                      { method: 'DELETE' }
                                    );
                                    if (res.ok) {
                                      setTasks(
                                        tasks.filter((t) => t._id !== task._id)
                                      );
                                    }
                                  } catch (err) {
                                    console.error('Failed to delete task', err);
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <UserIcon size={14} />
                                <span>
                                  {task.assignedTo
                                    ? task.assignedTo.name
                                    : 'Unassigned'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      {tasks.filter((t) => t.status === status).length ===
                        0 && (
                        <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500">Select a project to view tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team
                  </label>
                  <select
                    required
                    value={newProject.teamId}
                    onChange={(e) =>
                      setNewProject({ ...newProject, teamId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add New Task
            </h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newTask.status}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign To
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (members.length === 0) return;
                        const memberCounts = members.map((m) => {
                          const count = tasks.filter(
                            (t) =>
                              t.assignedTo &&
                              t.assignedTo._id === m._id &&
                              t.status !== 'Done'
                          ).length;
                          return { id: m._id, count, capacity: m.capacity };
                        });
                        memberCounts.sort((a, b) => {
                          if (a.count === b.count)
                            return b.capacity - a.capacity;
                          return a.count - b.count;
                        });
                        const bestMember = memberCounts[0];
                        setNewTask({ ...newTask, assignedTo: bestMember.id });
                        checkCapacity(bestMember.id);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Auto-assign
                    </button>
                  </div>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => {
                      setNewTask({ ...newTask, assignedTo: e.target.value });
                      checkCapacity(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} (Cap: {member.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {capacityWarning && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{capacityWarning}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {capacityWarning ? 'Assign Anyway' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
