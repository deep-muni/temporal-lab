import { EmotionRegistry } from '@/components/ui/emotion-registry';
import { Provider } from '@/components/ui/provider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Document summaries',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <Providers>{children}</Providers>
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
