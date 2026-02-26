'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  User,
  FolderKanban,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, fetchCurrentUser } from '@/store/slices/authSlice';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);

  // Reset image error whenever the avatarUrl changes
  const prevAvatarRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (user?.avatarUrl !== prevAvatarRef.current) {
      prevAvatarRef.current = user?.avatarUrl;
      setAvatarImgError(false);
    }
  }, [user?.avatarUrl]);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

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
      console.log(error);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
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
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/30 z-40 flex items-center px-4 gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">Taskify</span>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-60 w-64 h-screen bg-gray-900/95 md:bg-gray-900/40 backdrop-blur-2xl border-r border-gray-700/30 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${
            isMobileOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Taskify</h1>
              <p className="text-xs text-gray-500">Project Manager</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
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
                onClick={() => setIsMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white shadow-lg'
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
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-indigo-400'
                    }
                  `}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700/30">
          {user && (
            <div className="mb-3 px-4 py-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center gap-3">
                {user.avatarUrl && !avatarImgError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700/50 shadow-lg shrink-0"
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white font-semibold shadow-lg shrink-0">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
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
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-medium">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
