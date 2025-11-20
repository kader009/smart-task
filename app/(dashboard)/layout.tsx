import Link from 'next/link';
import { LayoutDashboard, Users, FolderKanban, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>

      {/* Glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Taskify
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-indigo-500/20 hover:text-white rounded-lg transition-all duration-200 hover:translate-x-1"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/teams"
            className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-indigo-500/20 hover:text-white rounded-lg transition-all duration-200 hover:translate-x-1"
          >
            <Users size={20} />
            <span>Teams</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-indigo-500/20 hover:text-white rounded-lg transition-all duration-200 hover:translate-x-1"
          >
            <FolderKanban size={20} />
            <span>Projects</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700/50">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
