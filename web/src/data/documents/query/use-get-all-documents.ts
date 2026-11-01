import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { DocumentSummary } from '../document.schema';
import { isBeingRead } from '../is-being-read';
import { useDocumentsRequests } from './documents-requests-context';
import { getAllDocumentsQueryKey } from './query-keys';

export const DOCUMENTS_POLL_MS = 1_000;

export const useGetAllDocuments = (): UseQueryResult<DocumentSummary[]> => {
  const requests = useDocumentsRequests();

  return useQuery({
    queryKey: getAllDocumentsQueryKey(),
    queryFn: () => requests.getAllDocuments(),
    refetchInterval: (query) =>
      anyBeingRead(query.state.data) ? DOCUMENTS_POLL_MS : false,
  });
};

function anyBeingRead(documents: DocumentSummary[] | undefined): boolean {
  return (documents ?? []).some((document) => isBeingRead(document.status));
}
