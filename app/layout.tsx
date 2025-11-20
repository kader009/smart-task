import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ReduxProvider } from '@/store/ReduxProvider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Taskify',
  description: 'Manage your projects and teams efficiently',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-black text-white antialiased`}
      >
        <ReduxProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
