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
  const { user } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // If user already exists (from persist or login), we're ready
      if (user) {
        setIsReady(true);
        return;
      }

      // Try to fetch user from API
      try {
        await dispatch(fetchCurrentUser()).unwrap();
        setIsReady(true);
      } catch (error) {
        // No valid session, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [dispatch, user, router]);

  // Don't render anything until we've checked auth
  if (!isReady) {
    return null;
  }

  // If no user, don't render (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, show children
  return <>{children}</>;
}
