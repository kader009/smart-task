'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-black to-gray-900"></div>

      {/* Central glowing effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl pt-16 sm:pt-0">
        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Smart Task
          <span className="block bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Management
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-300 max-w-2xl mx-auto">
          Manage projects, balance team workload, and automate assignments with
          intelligent task distribution.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:border-indigo-500 hover:bg-gray-800 transition-all duration-300"
          >
            Create Account
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Project Management
            </h3>
            <p className="text-sm text-gray-400">
              Organize and track all your projects in one place
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Team Collaboration
            </h3>
            <p className="text-sm text-gray-400">
              Work together seamlessly with your team
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-pink-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Auto Assignment
            </h3>
            <p className="text-sm text-gray-400">
              Intelligent task distribution based on workload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
