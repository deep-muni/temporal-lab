'use client';

import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { DOCUMENTS_COPY } from './documents-copy';
import { DocumentsTable } from './documents-table';
import { UploadDocumentDialog } from './upload-document-dialog';

export function DocumentsPage() {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const openUpload = () => setUploadOpen(true);

  return (
    <Container as="main" maxW="4xl" py="10" data-testid="documents-page">
      <Stack gap="6">
        <HStack justify="space-between" align="start">
          <Stack gap="1">
            <Heading as="h1" size="2xl">
              {DOCUMENTS_COPY.title}
            </Heading>
            <Text color="fg.muted">{DOCUMENTS_COPY.description}</Text>
          </Stack>
          <Button
            ref={uploadButton}
            onClick={openUpload}
            data-testid="documents-upload-button"
          >
            {DOCUMENTS_COPY.upload}
          </Button>
        </HStack>
        <DocumentsTable onUpload={openUpload} />
      </Stack>
      <UploadDocumentDialog
        open={isUploadOpen}
        onOpenChange={setUploadOpen}
        returnFocusTo={() => uploadButton.current}
      />
    </Container>
  );
}
