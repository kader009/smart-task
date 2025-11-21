'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  LogOut,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error) {
      toast.error('Logout failed');
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Teams',
      href: '/teams',
      icon: Users,
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
    },
  ];

  return (
    <aside className="relative z-10 w-64 h-screen bg-gray-900/40 backdrop-blur-2xl border-r border-gray-700/30 shadow-2xl hidden md:flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Taskify
            </h1>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              <Icon
                size={20}
                className={`
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-indigo-400'
                      : 'text-gray-500 group-hover:text-indigo-400'
                  }
                `}
              />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700/30">
        {user && (
          <div className="mb-3 px-4 py-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white font-semibold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={18} />
          <span className="font-medium">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>
  );
}
