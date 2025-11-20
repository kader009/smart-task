'use client';

import { useEffect, useState } from 'react';
import { Users, CheckSquare, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  recentLogs: any[];
  memberStats: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReassign = async () => {
    // In a real app, we might want to select a specific team.
    // For now, we'll just trigger it for the first team found or handle it generically if the API supports it.
    // The current API requires a teamId. Since we don't have a team selector here yet,
    // we might need to fetch teams first or just pick one from the memberStats if available.

    // Let's assume we want to reassign for the first team available in the stats for this demo.
    if (!data?.memberStats?.length) return;

    const teamId = data.memberStats[0].teamId;

    setReassigning(true);
    try {
      const res = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      if (res.ok) {
        await fetchData(); // Refresh data
        alert('Tasks reassigned successfully!');
      }
    } catch (error) {
      console.error('Reassign failed', error);
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          Error loading dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleReassign}
          disabled={reassigning}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg"
        >
          <ArrowRightLeft size={20} />
          {reassigning ? 'Reassigning...' : 'Reassign Tasks'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/30 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
              <FolderKanbanIcon />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-white">
                {data.totalProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{data.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-white">
                {data.memberStats.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Workload */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">Team Workload</h2>
          </div>
          <div className="p-6 space-y-4">
            {data.memberStats.map((member: any) => (
              <div
                key={member._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={clsx(
                        'font-bold',
                        member.currentLoad > member.capacity
                          ? 'text-red-400'
                          : 'text-white'
                      )}
                    >
                      {member.currentLoad}
                    </span>
                    <span className="text-gray-500"> / {member.capacity}</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        member.currentLoad > member.capacity
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      )}
                      style={{
                        width: `${Math.min(
                          (member.currentLoad / member.capacity) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.memberStats.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No team members found.
              </p>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {data.recentLogs.map((log: any) => (
                <div key={log._id} className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {data.recentLogs.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No activity logs yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderKanbanIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-folder-kanban"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v2" />
      <path d="M16 10v6" />
    </svg>
  );
}
