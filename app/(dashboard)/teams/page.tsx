'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTeams,
  fetchMembers,
  createTeam,
  addMember,
  deleteMember,
  setSelectedTeam,
} from '@/store/slices/teamsSlice';
import Skeleton from '@/app/components/ui/Skeleton';

export default function TeamsPage() {
  const dispatch = useAppDispatch();
  const { teams, selectedTeam, members, loading } = useAppSelector(
    (state) => state.teams
  );

  // Forms
  const [newTeamName, setNewTeamName] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    capacity: 5,
  });
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTeam) {
      dispatch(fetchMembers(selectedTeam._id));
    }
  }, [selectedTeam, dispatch]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createTeam(newTeamName)).unwrap();
      setNewTeamName('');
      setShowTeamModal(false);
      toast.success('Team created successfully!');
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      await dispatch(
        addMember({
          teamId: selectedTeam._id,
          member: newMember,
        })
      ).unwrap();
      setNewMember({ name: '', role: '', capacity: 5 });
      setShowMemberModal(false);
      toast.success('Member added successfully!');
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!selectedTeam) return;

    try {
      await dispatch(
        deleteMember({ teamId: selectedTeam._id, memberId })
      ).unwrap();
      toast.success('Member removed successfully!');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Teams & Members</h1>
        <button
          onClick={() => setShowTeamModal(true)}
          className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white text-sm font-bold leading-normal hover:bg-gray-700/50 transition-all"
        >
          <Plus size={16} />
          <span className="truncate">Create Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Team List */}
        <div className="md:col-span-1 space-y-2">
          <h2 className="font-semibold text-gray-300 mb-4">Your Teams</h2>
          {loading && teams.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))
          ) : (
            <>
              {teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => dispatch(setSelectedTeam(team))}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedTeam?._id === team._id
                      ? 'bg-indigo-500/30 backdrop-blur-xl text-white border border-indigo-500/50 shadow-lg'
                      : 'bg-gray-800/30 backdrop-blur-xl text-gray-300 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/50'
                  }`}
                >
                  {team.name}
                </button>
              ))}
              {teams.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No teams created yet.
                </p>
              )}
            </>
          )}
        </div>

        {/* Members List */}
        <div className="md:col-span-3">
          {loading && !selectedTeam ? (
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedTeam ? (
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  Members of {selectedTeam.name}
                </h2>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="flex items-center gap-2 text-sm bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 px-3 py-1.5 rounded-lg hover:bg-gray-600/50 transition-all duration-200 text-white"
                >
                  <UserPlus size={16} />
                  Add Member
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="pb-3 font-medium text-gray-400">Name</th>
                        <th className="pb-3 font-medium text-gray-400">Role</th>
                        <th className="pb-3 font-medium text-gray-400">
                          Capacity
                        </th>
                        <th className="pb-3 font-medium text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>
                            <td className="py-4">
                              <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="py-4">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="py-4">
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </td>
                            <td className="py-4">
                              <Skeleton className="h-6 w-6 rounded" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          {members.map((member) => (
                            <tr key={member._id}>
                              <td className="py-4 text-white font-medium">
                                {member.name}
                              </td>
                              <td className="py-4 text-gray-300">
                                {member.role}
                              </td>
                              <td className="py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {member.capacity} tasks
                                </span>
                              </td>
                              <td className="py-4">
                                <button
                                  onClick={() =>
                                    handleDeleteMember(member._id, member.name)
                                  }
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {members.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-8 text-center text-gray-400"
                              >
                                No members added to this team yet.
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-800/20 backdrop-blur-xl rounded-xl border-2 border-dashed border-gray-700/50">
              <p className="text-gray-400">
                Select or create a team to manage members
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">
              Create New Team
            </h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Design Team"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">
              Add Team Member
            </h2>
            <form onSubmit={handleAddMember}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Capacity (Tasks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    required
                    value={newMember.capacity}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Max 5 tasks recommended
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
