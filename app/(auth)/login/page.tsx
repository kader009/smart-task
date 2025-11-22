'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        // Set user in Redux store
        dispatch(
          setUser({
            id: data.userId,
            name: data.name,
            email: data.email,
          })
        );

        toast.success('Login successful!', {
          description: 'Redirecting to dashboard...',
        });

        // Clear input fields
        setEmail('');
        setPassword('');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
        toast.error('Login failed', {
          description: data.error || 'Please check your credentials',
        });
      }
    } catch (err) {
      setError('Something went wrong');
      toast.error('Something went wrong', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-[#111722] shadow-2xl flex flex-col md:flex-row">
        {/* Left Side - Branding */}
        <div className="w-full md:w-1/2 bg-[#192233]/50 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-white tracking-tight text-4xl font-bold leading-tight mb-4">
            Welcome Back
          </h1>
          <p className="text-[#92a4c9] text-base">
            Sign in to continue managing your projects, teams, and tasks
            efficiently.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="flex flex-col h-full">
            <div className="flex flex-col">
              <h2 className="text-white tracking-tight text-3xl font-bold leading-tight mb-1">
                Sign In
              </h2>
              <p className="text-[#92a4c9] mb-6">
                Enter your credentials to access your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-2">
                    Email
                  </p>
                  <input
                    className="w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-[#324467] bg-[#192233] h-12 placeholder:text-[#92a4c9] px-4 text-base"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-2">
                    Password
                  </p>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-[#324467] bg-[#192233] h-12 placeholder:text-[#92a4c9] px-4 pr-12 text-base"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#92a4c9] hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </label>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center whitespace-nowrap rounded-lg bg-indigo-600 h-12 px-6 text-base font-semibold text-white transition-colors hover:bg-indigo-500 mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-[#92a4c9]">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline transition-colors"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
