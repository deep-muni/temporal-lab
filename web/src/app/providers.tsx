'use client';

import { readPublicEnv } from '@/configuration/public-env';
import { createDocumentsRequests } from '@/data/documents/query/documents-requests';
import { DocumentsRequestsProvider } from '@/data/documents/query/documents-requests-context';
import { createApiClient } from '@/lib/http/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1 }, mutations: { retry: 0 } },
      }),
  );
  const [documentsRequests] = useState(() =>
    createDocumentsRequests(createApiClient(readPublicEnv().apiUrl)),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DocumentsRequestsProvider requests={documentsRequests}>
        {children}
      </DocumentsRequestsProvider>
    </QueryClientProvider>
  );
}
