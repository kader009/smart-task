'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import Skeleton from '@/app/components/ui/Skeleton';

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        if (!mounted) return;
        setName(data.name || '');
        setEmail(data.email || '');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password.length > 0) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Update failed');
      }

      toast.success('Profile updated');
      // Refresh auth state
      dispatch(fetchCurrentUser());
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl sm:max-w-2xl bg-gray-800/30 backdrop-blur-xl p-6 sm:p-8 rounded-xl">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end mt-6">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl sm:max-w-2xl bg-gray-800/30 backdrop-blur-xl p-6 sm:p-8 rounded-xl">
        <h1 className="text-white text-2xl font-bold mb-4 text-center sm:text-left">
          Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800/40 border border-gray-700/50 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Email</label>
            <input
              value={email}
              readOnly
              className="w-full bg-gray-900/30 border border-gray-700/30 rounded px-3 py-2 text-gray-400"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full bg-gray-800/40 border border-gray-700/50 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full bg-gray-800/40 border border-gray-700/50 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg hover:bg-gray-700/50 transition-all font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
