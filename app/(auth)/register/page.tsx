'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success('Registration successful!', {
          description: 'Redirecting to login page...',
        });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        toast.error('Registration failed', {
          description: data.error || 'Please try again',
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
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-indigo-500 w-10 h-10" />
            <span className="text-2xl font-bold text-white">ProjectFlow</span>
          </div>
          <h1 className="text-white tracking-tight text-4xl font-bold leading-tight mb-4">
            Streamline Your Workflow
          </h1>
          <p className="text-[#92a4c9] text-base">
            Manage projects, teams, and tasks efficiently. Assign tasks, track
            workload, and rebalance with ease.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="flex flex-col h-full">
            <div className="flex flex-col">
              <h2 className="text-white tracking-tight text-3xl font-bold leading-tight mb-1">
                Create an Account
              </h2>
              <p className="text-[#92a4c9] mb-6">
                Start your journey with ProjectFlow.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-2">
                    Username
                  </p>
                  <input
                    className="w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-[#324467] bg-[#192233] h-12 placeholder:text-[#92a4c9] px-4 text-base"
                    placeholder="Choose a username"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

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
                      placeholder="Create a password"
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

                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-2">
                    Confirm Password
                  </p>
                  <input
                    className="w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-[#324467] bg-[#192233] h-12 placeholder:text-[#92a4c9] px-4 text-base"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
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
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-[#92a4c9]">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline transition-colors"
                  >
                    Log In
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
