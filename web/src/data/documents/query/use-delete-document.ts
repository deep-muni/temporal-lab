import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { DocumentSummary } from '../document.schema';
import { useDocumentsRequests } from './documents-requests-context';
import {
  deleteDocumentMutationKey,
  getAllDocumentsQueryKey,
} from './query-keys';

export const useDeleteDocument = (): UseMutationResult<void, Error, string> => {
  const requests = useDocumentsRequests();
  const client = useQueryClient();

  return useMutation({
    mutationKey: deleteDocumentMutationKey(),
    mutationFn: (id: string) => requests.deleteDocument(id),
    onSuccess: (_, id) => {
      client.setQueryData<DocumentSummary[]>(
        getAllDocumentsQueryKey(),
        (documents) => documents?.filter((document) => document.id !== id),
      );
      void client.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
    },
  });
};
