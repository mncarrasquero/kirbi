import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/Sidebar';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description: 'Inventory management system for electrical services construction company',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <main className="flex-1 overflow-auto">
            <div className="border-b">
              <div className="container mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
                <Image
                  src="https://kirbyelectricco.com/wp-content/uploads/2021/03/ColorGradient.png"
                  alt="Kirby Electric Company"
                  width={200}
                  height={45}
                  priority
                  className="h-[45px] w-auto"
                />
                <Sidebar />
              </div>
            </div>
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}