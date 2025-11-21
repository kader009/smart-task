'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If user already exists (from persist or login), we're ready
      if (user) {
        setIsInitialCheck(false);
        return;
      }

      // Try to fetch user from API (only if not already loading)
      if (!loading) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
          setIsInitialCheck(false);
        } catch (error) {
          // No valid session, redirect to login
          setIsInitialCheck(false);
          router.push('/login');
        }
      }
    };

    checkAuth();
    // Only run once on mount
  }, [dispatch, router]);

  // Only show loading spinner on initial check, not during navigation
  if (isInitialCheck && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If no user after checking, don't render (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, show children immediately
  return <>{children}</>;
}
