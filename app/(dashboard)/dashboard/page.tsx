'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  recentLogs: any[];
  memberStats: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReassign = async () => {
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
        // You might want to use a toast here instead of alert
        // alert('Tasks reassigned successfully!');
      }
    } catch (error) {
      console.error('Reassign failed', error);
    } finally {
      setReassigning(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          Error loading dashboard.
        </div>
      </div>
    );
  }

  const overloadedMembersCount = data.memberStats.filter(
    (m) => m.currentLoad > m.capacity
  ).length;

  return (
    <main className="flex-1 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* PageHeading */}
        <div className="flex flex-wrap justify-between gap-3 mb-8">
          <div className="flex min-w-72 flex-col gap-2">
            <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Dashboard Overview
            </p>
            <p className="text-gray-400 text-base font-normal leading-normal">
              An overview of projects, tasks, and team workload.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50">
            <p className="text-gray-400 text-base font-medium leading-normal">
              Total Active Projects
            </p>
            <p className="text-white tracking-light text-3xl font-bold leading-tight">
              {data.totalProjects}
            </p>
            <p className="text-green-400 text-base font-medium leading-normal">
              +2 this week
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50">
            <p className="text-gray-400 text-base font-medium leading-normal">
              Total Open Tasks
            </p>
            <p className="text-white tracking-light text-3xl font-bold leading-tight">
              {data.openTasks}
            </p>
            <p className="text-yellow-400 text-base font-medium leading-normal">
              -5 this week
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50">
            <p className="text-gray-400 text-base font-medium leading-normal">
              Tasks Completed
            </p>
            <p className="text-white tracking-light text-3xl font-bold leading-tight">
              {data.completedTasks}
            </p>
            <p className="text-green-400 text-base font-medium leading-normal">
              +10 this week
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50">
            <p className="text-gray-400 text-base font-medium leading-normal">
              Overloaded Members
            </p>
            <p className="text-white tracking-light text-3xl font-bold leading-tight">
              {overloadedMembersCount}
            </p>
            <p className="text-yellow-400 text-base font-medium leading-normal">
              +1 this week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Team Workload Section */}
          <div className="xl:col-span-2">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Team Workload
              </h2>
              <button
                onClick={handleReassign}
                disabled={reassigning}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 pl-3 text-sm font-bold leading-normal tracking-[0.015em] transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={clsx(reassigning && 'animate-spin')}
                />
                <span className="truncate">
                  {reassigning ? 'Reassigning...' : 'Reassign Tasks'}
                </span>
              </button>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-xl p-4 rounded-xl border border-gray-700/50">
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-gray-700/50">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-400">
                      Team Member
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-gray-400">
                      Workload
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-400">Tasks</p>
                  </div>
                </div>
                {/* Table Rows */}
                <div className="space-y-2 pt-2">
                  {data.memberStats.map((member: any) => {
                    const loadPercentage = Math.min(
                      (member.currentLoad / member.capacity) * 100,
                      100
                    );
                    const isOverloaded = member.currentLoad > member.capacity;

                    return (
                      <div
                        key={member._id}
                        className="grid grid-cols-6 gap-4 items-center px-4 py-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 col-span-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-white truncate">
                            {member.name}
                          </p>
                          {isOverloaded && (
                            <span
                              className="w-3 h-3 bg-yellow-500 rounded-full shrink-0"
                              title="Overloaded"
                            ></span>
                          )}
                        </div>
                        <div className="col-span-3">
                          <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                            <div
                              className={clsx(
                                'h-2.5 rounded-full transition-all duration-500',
                                isOverloaded ? 'bg-yellow-500' : 'bg-indigo-500'
                              )}
                              style={{ width: `${loadPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-right font-medium text-gray-400">
                          {member.currentLoad}/{member.capacity}
                        </p>
                      </div>
                    );
                  })}
                  {data.memberStats.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      No team members found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reassignments (Activity Log) */}
          <div className="xl:col-span-1">
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
              Recent Activity
            </h2>
            <div className="bg-gray-800/30 backdrop-blur-xl p-4 rounded-xl border border-gray-700/50">
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-gray-700/50">
                  <p className="text-sm col-span-3 font-semibold text-gray-400">
                    Activity
                  </p>
                  <p className="text-sm font-semibold text-gray-400 text-right">
                    Date
                  </p>
                </div>
                {/* Table Rows */}
                <div className="space-y-3 pt-2">
                  {data.recentLogs.map((log: any) => (
                    <div
                      key={log._id}
                      className="grid grid-cols-4 gap-4 items-center px-4 py-2 hover:bg-gray-700/30 rounded-lg transition-colors"
                    >
                      <p className="font-medium text-white col-span-3 text-sm truncate">
                        {log.message}
                      </p>
                      <p className="text-right text-gray-400 text-sm">
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                  {data.recentLogs.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      No recent activity.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
