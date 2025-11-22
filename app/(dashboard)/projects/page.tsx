'use client';

import { useState, useEffect } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProjects,
  fetchTasks,
  createProject,
  createTask,
  updateTask,
  deleteTask,
  setSelectedProject,
} from '@/store/slices/projectsSlice';
import { fetchTeams, fetchMembers } from '@/store/slices/teamsSlice';

import { Project, Task, Team, Member } from '@/app/types';
import CreateProjectModal from '@/app/components/projects/CreateProjectModal';
import CreateTaskModal from '@/app/components/projects/CreateTaskModal';
import EditTaskModal from '@/app/components/projects/EditTaskModal';
import TaskTable from '@/app/components/projects/TaskTable';
import TaskFilters from '@/app/components/projects/TaskFilters';
import ProjectDropdown from '@/app/components/projects/ProjectDropdown';
import Skeleton from '@/app/components/ui/Skeleton';
export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, selectedProject, tasks, loading } = useAppSelector(
    (state) => state.projects
  );
  const { teams, members } = useAppSelector((state) => state.teams);

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
    dispatch(fetchProjects());
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchTasks(selectedProject._id));
      const teamId =
        typeof selectedProject.teamId === 'object'
          ? selectedProject.teamId._id
          : selectedProject.teamId;
      dispatch(fetchMembers(teamId));
    }
  }, [selectedProject, dispatch]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createProject(newProject)).unwrap();
      setShowProjectModal(false);
      setNewProject({ name: '', description: '', teamId: '' });
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      await dispatch(
        createTask({
          ...newTask,
          projectId: selectedProject._id,
          assignedTo: newTask.assignedTo || null,
        })
      ).unwrap();
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Low',
        status: 'Pending',
        assignedTo: '',
      });
      setCapacityWarning(null);
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    toast('Are you sure you want to delete this task?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await dispatch(deleteTask(taskId)).unwrap();
            toast.success('Task deleted successfully');
            setCapacityWarning(null);
          } catch (error) {
            toast.error('Failed to delete task');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const taskId = editingTask._id || (editingTask as any).id;
    if (!taskId) {
      toast.error('Invalid task');
      return;
    }

    try {
      const payload = {
        ...editingTask,
        _id: taskId,
        assignedTo:
          typeof editingTask.assignedTo === 'object' && editingTask.assignedTo
            ? editingTask.assignedTo._id
            : editingTask.assignedTo,
      };

      await dispatch(updateTask(payload)).unwrap();
      setShowEditTaskModal(false);
      setEditingTask(null);
      setCapacityWarning(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task');
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

  // Calculate member stats for dropdowns
  const enrichedMembers = members.map((m) => ({
    ...m,
    currentTasks: tasks.filter(
      (t) => t.assignedTo?._id === m._id && t.status !== 'Done'
    ).length,
  }));

  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">
              Manage Tasks
            </h1>
            {projects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Project:</span>
                <ProjectDropdown
                  projects={projects}
                  selectedProject={selectedProject}
                  onSelectProject={(project) => dispatch(setSelectedProject(project))}
                />
              </div>
            )}
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
          {loading && tasks.length === 0 ? (
            <div className="overflow-x-auto overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-6 w-6 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          )}
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
          members={enrichedMembers}
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
            members={enrichedMembers}
            capacityWarning={capacityWarning}
            checkCapacity={checkCapacity}
          />
        )}
      </div>
    </div>
  );
}
