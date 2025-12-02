import { Inter } from 'next/font/google';
import Sidebar from '@/app/components/Sidebar';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div
        className={`${inter.className} relative flex h-screen overflow-hidden`}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-black to-gray-900"></div>

        {/* Glowing effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="relative z-10 flex-1 overflow-y-auto pt-16 md:pt-0">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
