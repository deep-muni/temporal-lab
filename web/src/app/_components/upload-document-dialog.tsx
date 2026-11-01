'use client';

import { UPLOAD_MAX_BYTES } from '@/data/documents/document.schema';
import { getUploadErrorMessage } from '@/data/documents/get-upload-error-message';
import { useUploadDocument } from '@/data/documents/query/use-upload-document';
import { formatBytes } from '@/lib/format-bytes.util';
import {
  Alert,
  Button,
  CloseButton,
  Dialog,
  FileUpload,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { UPLOAD_DIALOG_COPY } from './documents-copy';

const ACCEPTED_FILES = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: () => HTMLElement | null;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  returnFocusTo,
}: UploadDocumentDialogProps) {
  const upload = useUploadDocument();
  const [file, setFile] = useState<File | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const isSending = upload.isPending;

  const close = () => {
    upload.reset();
    setFile(null);
    setRefusal(null);
    onOpenChange(false);
  };

  const choose = (chosen: File | null, reason: string | null) => {
    setFile(chosen);
    setRefusal(reason);
  };

  const send = (chosen: File) => {
    setRefusal(null);
    upload.mutate(chosen, {
      onSuccess: close,
      onError: (error) => setRefusal(getUploadErrorMessage(error)),
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => (details.open ? onOpenChange(true) : close())}
      closeOnEscape={!isSending}
      closeOnInteractOutside={!isSending}
      finalFocusEl={returnFocusTo}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="upload-document-dialog">
            <Dialog.Header>
              <Dialog.Title>{UPLOAD_DIALOG_COPY.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text color="fg.muted">{UPLOAD_DIALOG_COPY.description}</Text>
                <FileChooser
                  disabled={isSending}
                  onChoose={(chosen) => choose(chosen, null)}
                  onRefuse={() => choose(null, UPLOAD_DIALOG_COPY.wrongFile)}
                />
                <ChosenFile file={file} />
                <Refusal message={refusal} />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={close}
                disabled={isSending}
                data-testid="upload-document-cancel-button"
              >
                {UPLOAD_DIALOG_COPY.cancel}
              </Button>
              <Button
                onClick={() => file && send(file)}
                disabled={!file}
                loading={isSending}
                loadingText={UPLOAD_DIALOG_COPY.sending}
                data-testid="upload-document-submit-button"
              >
                {UPLOAD_DIALOG_COPY.upload}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                disabled={isSending}
                aria-label={UPLOAD_DIALOG_COPY.close}
                data-testid="upload-document-close-button"
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

interface FileChooserProps {
  disabled: boolean;
  onChoose: (file: File) => void;
  onRefuse: () => void;
}

function FileChooser({ disabled, onChoose, onRefuse }: FileChooserProps) {
  return (
    <FileUpload.Root
      maxFiles={1}
      maxFileSize={UPLOAD_MAX_BYTES}
      accept={ACCEPTED_FILES}
      disabled={disabled}
      onFileAccept={({ files }) => files[0] && onChoose(files[0])}
      onFileReject={({ files }) => files.length > 0 && onRefuse()}
    >
      <FileUpload.HiddenInput
        aria-label={UPLOAD_DIALOG_COPY.fileInputLabel}
        data-testid="upload-document-file-input"
      />
      <FileUpload.Dropzone width="full" data-testid="upload-document-dropzone">
        <FileUpload.DropzoneContent>
          <Text>{UPLOAD_DIALOG_COPY.dropzoneHint}</Text>
        </FileUpload.DropzoneContent>
        <FileUpload.Trigger asChild>
          <Button
            size="sm"
            variant="outline"
            data-testid="upload-document-browse-button"
          >
            {UPLOAD_DIALOG_COPY.browse}
          </Button>
        </FileUpload.Trigger>
      </FileUpload.Dropzone>
    </FileUpload.Root>
  );
}

function ChosenFile({ file }: { file: File | null }) {
  if (!file) {
    return null;
  }
  return (
    <Text data-testid="upload-document-selected-file">
      {`${file.name} · ${formatBytes(file.size)}`}
    </Text>
  );
}

function Refusal({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <Alert.Root status="error" data-testid="upload-document-rejection-alert">
      <Alert.Indicator />
      <Alert.Title>{message}</Alert.Title>
    </Alert.Root>
  );
}
