import { EmotionRegistry } from '@/components/ui/emotion-registry';
import { Provider } from '@/components/ui/provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppHeader } from './_components/layout/app-header';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Documents · Temporal Lab',
  description: 'Upload documents and watch them get read in the background.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <Providers>
              <AppHeader />
              {children}
            </Providers>
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
