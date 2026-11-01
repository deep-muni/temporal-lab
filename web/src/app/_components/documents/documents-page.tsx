'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { BRAND_PALETTE } from '@/theme/brand';
import {
  Container,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { LuUpload } from 'react-icons/lu';
import { DOCUMENTS_COPY } from './documents-copy';
import { DocumentsOverview } from './documents-overview';
import { DocumentsTable } from './documents-table';
import { UploadDocumentDialog } from './upload/upload-document-dialog';

export function DocumentsPage() {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const openUpload = () => setUploadOpen(true);

  return (
    <Container as="main" maxW="5xl" py="10" data-testid="documents-page">
      <Stack gap="8">
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', sm: 'flex-end' }}
          gap="4"
        >
          <Stack gap="1.5" maxW="2xl">
            <Heading as="h1" size="2xl" letterSpacing="tight">
              {DOCUMENTS_COPY.title}
            </Heading>
            <Text color="fg.muted">{DOCUMENTS_COPY.description}</Text>
          </Stack>
          <Tooltip content={DOCUMENTS_COPY.upload} showArrow openDelay={200}>
            <IconButton
              ref={uploadButton}
              colorPalette={BRAND_PALETTE}
              size="lg"
              aria-label={DOCUMENTS_COPY.upload}
              onClick={openUpload}
              data-testid="documents-upload-button"
            >
              <LuUpload />
            </IconButton>
          </Tooltip>
        </Flex>
        <DocumentsOverview />
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
