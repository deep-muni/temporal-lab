import { Provider } from '@/components/ui/provider';
import type { DocumentsRequests } from '@/data/documents/query/documents-requests';
import { DocumentsRequestsProvider } from '@/data/documents/query/documents-requests-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';

export function createTestWrapper(requests: DocumentsRequests) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <Provider>
        <QueryClientProvider client={queryClient}>
          <DocumentsRequestsProvider requests={requests}>
            {children}
          </DocumentsRequestsProvider>
        </QueryClientProvider>
      </Provider>
    );
  };
}

export function renderWithRequests(
  ui: ReactElement,
  requests: DocumentsRequests,
): RenderResult & { user: UserEvent } {
  return Object.assign(render(ui, { wrapper: createTestWrapper(requests) }), {
    user: userEvent.setup(),
  });
}
