'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DocumentsRequests } from './documents-requests';

const DocumentsRequestsContext = createContext<DocumentsRequests | undefined>(
  undefined,
);

export function DocumentsRequestsProvider({
  requests,
  children,
}: {
  requests: DocumentsRequests;
  children: ReactNode;
}) {
  return (
    <DocumentsRequestsContext.Provider value={requests}>
      {children}
    </DocumentsRequestsContext.Provider>
  );
}

export function useDocumentsRequests(): DocumentsRequests {
  const requests = useContext(DocumentsRequestsContext);
  if (!requests) {
    throw new Error(
      'useDocumentsRequests must be used inside a DocumentsRequestsProvider',
    );
  }
  return requests;
}
