import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gestion de Pagos',
  description: 'Sitema de gestión de pagos para tesis 20',
  /* icons: {
    icon: '/images/tesis20-logo.png',
    shortcut: '/images/tesis20-logo.png',
    apple: '/images/tesis20-logo.png',
  }, */
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}