'use client';

import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { DOCUMENTS_COPY } from './documents-copy';
import { DocumentsTable } from './documents-table';

export function DocumentsPage() {
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
          <Button disabled data-testid="documents-upload-button">
            {DOCUMENTS_COPY.upload}
          </Button>
        </HStack>
        <DocumentsTable onUpload={() => undefined} canUpload={false} />
      </Stack>
    </Container>
  );
}
