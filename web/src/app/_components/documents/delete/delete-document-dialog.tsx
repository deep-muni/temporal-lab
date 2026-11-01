'use client';

import type { DocumentSummary } from '@/data/documents/document.schema';
import { useDeleteDocument } from '@/data/documents/query/use-delete-document';
import {
  Alert,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { DELETE_DIALOG_COPY } from './delete-document-copy';

interface DeleteDocumentDialogProps {
  open: boolean;
  document: DocumentSummary | null;
  onClose: () => void;
  returnFocusTo: () => HTMLElement | null;
}

export function DeleteDocumentDialog({
  open,
  document,
  onClose,
  returnFocusTo,
}: DeleteDocumentDialogProps) {
  const remove = useDeleteDocument();
  const isDeleting = remove.isPending;

  const close = () => {
    remove.reset();
    onClose();
  };

  const confirm = (id: string) => remove.mutate(id, { onSuccess: close });

  return (
    <Dialog.Root
      role="alertdialog"
      open={open}
      onOpenChange={(details) => !details.open && close()}
      closeOnEscape={!isDeleting}
      closeOnInteractOutside={!isDeleting}
      finalFocusEl={returnFocusTo}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="delete-document-dialog" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>{DELETE_DIALOG_COPY.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Dialog.Description color="fg.muted">
                  {DELETE_DIALOG_COPY.description(document?.name ?? '')}
                </Dialog.Description>
                <DeleteFailure isShown={remove.isError} />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={close}
                disabled={isDeleting}
                data-testid="delete-document-cancel-button"
              >
                {DELETE_DIALOG_COPY.cancel}
              </Button>
              <Button
                colorPalette="red"
                onClick={() => document && confirm(document.id)}
                loading={isDeleting}
                loadingText={DELETE_DIALOG_COPY.deleting}
                data-testid="delete-document-confirm-button"
              >
                {DELETE_DIALOG_COPY.confirm}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                disabled={isDeleting}
                aria-label={DELETE_DIALOG_COPY.close}
                data-testid="delete-document-close-button"
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function DeleteFailure({ isShown }: { isShown: boolean }) {
  if (!isShown) {
    return null;
  }
  return (
    <Alert.Root status="error" data-testid="delete-document-error-alert">
      <Alert.Indicator />
      <Alert.Title>{DELETE_DIALOG_COPY.failed}</Alert.Title>
    </Alert.Root>
  );
}
