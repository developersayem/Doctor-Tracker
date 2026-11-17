import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Doctor Tracker | Clinical Enterprise Admin Portal',
  description:
    'Administrative healthcare dashboard application managing physician rosters, assigned patient telemetry, and hospital operational analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface min-h-screen">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
