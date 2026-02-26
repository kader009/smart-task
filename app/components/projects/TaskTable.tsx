import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/app/types';

const TASKS_PER_PAGE = 8;

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-3">
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {paginatedTasks.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-gray-700/20 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-white wrap-break-word whitespace-normal min-w-[200px]">
                  {task.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white font-semibold text-xs">
                      {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-300">
                      {task.assignedTo?.name || 'Unassigned'}
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
                          : 'bg-green-500/20 text-green-300 border border-green-500/30',
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
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
                    )}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors hover:bg-indigo-500/10 rounded"
                      title="Edit Task"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(task._id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10 rounded"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-400">
            Showing {(currentPage - 1) * TASKS_PER_PAGE + 1}–
            {Math.min(currentPage * TASKS_PER_PAGE, tasks.length)} of{' '}
            {tasks.length} tasks
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all border',
                  page === currentPage
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50',
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
