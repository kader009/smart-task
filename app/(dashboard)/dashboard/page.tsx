'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardData,
  reassignTasks,
} from '@/store/slices/dashboardSlice';
import Skeleton from '@/app/components/ui/Skeleton';
import { MemberStat, ActivityLog } from '@/app/types';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleReassign = async () => {
    if (!data?.memberStats?.length) return;

    const teamId = data.memberStats[0].teamId;
    if (!teamId) {
      toast.error('Team ID not found');
      return;
    }

    setReassigning(true);
    try {
      await dispatch(reassignTasks(teamId)).unwrap();
      dispatch(fetchDashboardData()); // Refresh data
      toast.success('Tasks reassigned successfully!');
    } catch (error) {
      toast.error('Reassign failed');
      console.log(error);
    } finally {
      setReassigning(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  const overloadedMembersCount = data?.memberStats.filter(
    (m) => m.currentLoad > m.capacity
  ).length;

  return (
    <main className="flex-1 p-4 lg:p-6">
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
          {loading && !data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50"
              >
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : (
            <>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50">
                <p className="text-gray-400 text-base font-medium leading-normal">
                  Total Active Projects
                </p>
                <p className="text-white tracking-light text-3xl font-bold leading-tight">
                  {data?.totalProjects ?? 0}
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
                  {data?.openTasks ?? 0}
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
                  {data?.completedTasks ?? 0}
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
                  {overloadedMembersCount ?? 0}
                </p>
                <p className="text-yellow-400 text-base font-medium leading-normal">
                  +1 this week
                </p>
              </div>
            </>
          )}
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
                disabled={reassigning || loading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white gap-2 pl-3 text-sm font-bold leading-normal hover:bg-gray-700/50 transition-all disabled:opacity-50"
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
            <div className="bg-gray-800/30 backdrop-blur-xl p-4 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="flex flex-col overflow-x-auto">
                <div className="min-w-[600px]">
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
                      <p className="text-sm font-semibold text-gray-400">
                        Tasks
                      </p>
                    </div>
                  </div>
                  {/* Table Rows */}
                  <div className="space-y-2 pt-2">
                    {loading && !data ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-6 gap-4 items-center px-4 py-3"
                        >
                          <div className="col-span-2 flex items-center gap-3">
                            <Skeleton className="w-9 h-9 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="col-span-3">
                            <Skeleton className="h-2.5 w-full rounded-full" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-4 w-8 ml-auto" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {data?.memberStats.map(
                          (member: MemberStat, index: number) => {
                            const loadPercentage = Math.min(
                              (member.currentLoad / member.capacity) * 100,
                              100
                            );
                            const isOverloaded =
                              member.currentLoad > member.capacity;

                            const normalColors = [
                              'bg-blue-500',
                              'bg-green-500',
                              'bg-purple-500',
                              'bg-pink-500',
                              'bg-cyan-500',
                              'bg-teal-500',
                              'bg-orange-500',
                            ];
                            const barColor = isOverloaded
                              ? 'bg-red-500'
                              : normalColors[index % normalColors.length];

                            return (
                              <div
                                key={member._id}
                                className="grid grid-cols-6 gap-4 items-center px-4 py-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                              >
                                <div className="flex items-center gap-3 col-span-2">
                                  <div className="w-9 h-9 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white font-semibold shadow-lg text-sm">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="font-medium text-white truncate">
                                    {member.name}
                                  </p>
                                  {isOverloaded && (
                                    <span
                                      className="w-3 h-3 bg-red-500 rounded-full shrink-0"
                                      title="Overloaded"
                                    ></span>
                                  )}
                                </div>
                                <div className="col-span-3">
                                  <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                    <div
                                      className={clsx(
                                        'h-2.5 rounded-full transition-all duration-500',
                                        barColor
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
                          }
                        )}
                        {data?.memberStats.length === 0 && (
                          <p className="text-gray-400 text-center py-4">
                            No team members found.
                          </p>
                        )}
                      </>
                    )}
                  </div>
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
                  {loading && !data ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 gap-4 items-start px-4 py-2"
                      >
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-3 w-12 ml-auto mb-1" />
                          <Skeleton className="h-3 w-8 ml-auto" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {data?.recentLogs.map((log: ActivityLog) => (
                        <div
                          key={log._id}
                          className="grid grid-cols-4 gap-4 items-start px-4 py-2 hover:bg-gray-700/30 rounded-lg transition-colors"
                        >
                          <p className="font-medium text-white col-span-3 text-sm break-all">
                            {log.details}
                          </p>
                          <div className="text-right text-gray-400 text-xs">
                            <p>
                              {new Date(log.createdAt).toLocaleTimeString(
                                undefined,
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                }
                              )}
                            </p>
                            <p className="text-gray-500">
                              {new Date(log.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      {data?.recentLogs.length === 0 && (
                        <p className="text-gray-400 text-center py-4">
                          No recent activity.
                        </p>
                      )}
                    </>
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
