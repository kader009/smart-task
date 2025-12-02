import clsx from 'clsx';
import { Trash2, Pencil } from 'lucide-react';
import { Task } from '@/app/types';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  return (
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
          {tasks.map((task) => (
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
  );
}
