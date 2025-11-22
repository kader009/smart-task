import React from 'react';
import { Team, CreateProjectModalProps } from '@/app/types';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  newProject,
  setNewProject,
  teams,
}: CreateProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto my-8">
        <h2 className="text-xl font-bold mb-4 text-white">
          Create New Project
        </h2>
        <form onSubmit={onSubmit}>
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
              onClick={onClose}
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
  );
}
