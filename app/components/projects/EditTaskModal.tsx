import React from 'react';
import clsx from 'clsx';
import { Member, Task, EditTaskModalProps } from '@/app/types';

export default function EditTaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  setEditingTask,
  members,
  capacityWarning,
  checkCapacity,
}: EditTaskModalProps) {
  if (!isOpen || !editingTask) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto my-8">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Task</h2>
        <form onSubmit={onSubmit} className="space-y-6">
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
                  : (editingTask.assignedTo as any) || ''
              }
              onChange={(e) => {
                const memberId = e.target.value;
                const member = members.find((m) => m._id === memberId);
                setEditingTask({
                  ...editingTask,
                  assignedTo: member
                    ? ({ _id: member._id, name: member.name } as any)
                    : null,
                });
                if (memberId) checkCapacity(memberId);
              }}
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} (Tasks: {member.currentTasks || 0} / Cap:{' '}
                  {member.capacity})
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
              onClick={onClose}
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
  );
}
