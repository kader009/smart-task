'use client';

import { useState, useEffect } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { Project, Task, Team, Member } from '@/app/types';
import CreateProjectModal from '@/app/components/projects/CreateProjectModal';
import CreateTaskModal from '@/app/components/projects/CreateTaskModal';
import EditTaskModal from '@/app/components/projects/EditTaskModal';
import TaskTable from '@/app/components/projects/TaskTable';
import TaskFilters from '@/app/components/projects/TaskFilters';

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
          <TaskFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            showStatusDropdown={showStatusDropdown}
            setShowStatusDropdown={setShowStatusDropdown}
            showPriorityDropdown={showPriorityDropdown}
            setShowPriorityDropdown={setShowPriorityDropdown}
          />

          {/* Table */}
          <TaskTable tasks={filteredTasks} onEdit={handleEditTask} />
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
          newProject={newProject}
          setNewProject={setNewProject}
          teams={teams}
        />

        {/* Add Task Modal */}
        <CreateTaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setCapacityWarning(null);
          }}
          onSubmit={handleCreateTask}
          newTask={newTask}
          setNewTask={setNewTask}
          members={members}
          capacityWarning={capacityWarning}
          checkCapacity={checkCapacity}
        />

        {/* Edit Task Modal */}
        {editingTask && (
          <EditTaskModal
            isOpen={showEditTaskModal}
            onClose={() => {
              setShowEditTaskModal(false);
              setEditingTask(null);
              setCapacityWarning(null);
            }}
            onSubmit={handleUpdateTask}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            members={members}
            capacityWarning={capacityWarning}
            checkCapacity={checkCapacity}
          />
        )}
      </div>
    </div>
  );
}
