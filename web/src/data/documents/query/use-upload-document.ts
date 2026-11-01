import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { DocumentSummary } from '../document.schema';
import { useDocumentsRequests } from './documents-requests-context';
import {
  getAllDocumentsQueryKey,
  uploadDocumentMutationKey,
} from './query-keys';

export const useUploadDocument = (): UseMutationResult<
  DocumentSummary,
  Error,
  File
> => {
  const requests = useDocumentsRequests();
  const client = useQueryClient();

  return useMutation({
    mutationKey: uploadDocumentMutationKey(),
    mutationFn: (file: File) => requests.uploadDocument(file),
    onSuccess: (accepted) => {
      client.setQueryData<DocumentSummary[]>(
        getAllDocumentsQueryKey(),
        (documents) => withNewestFirst(accepted, documents),
      );
      void client.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
    },
  });
};

function withNewestFirst(
  accepted: DocumentSummary,
  documents: DocumentSummary[] | undefined,
): DocumentSummary[] {
  const others = (documents ?? []).filter(
    (document) => document.id !== accepted.id,
  );
  return [accepted, ...others];
}
