'use client';

import type { DocumentSummary } from '@/data/documents/document.schema';
import { useGetAllDocuments } from '@/data/documents/query/use-get-all-documents';
import { isAnyBeingRead } from '@/data/documents/summarize-documents';
import { formatAbsoluteTime } from '@/lib/date/format-absolute-time';
import { formatRelativeTime } from '@/lib/date/format-relative-time';
import { BRAND_PALETTE } from '@/theme/brand';
import {
  Alert,
  Box,
  Button,
  Card,
  EmptyState,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  Status,
  Table,
  Text,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuInbox, LuRefreshCw, LuUpload } from 'react-icons/lu';
import { DocumentFileIcon, fileKindOf } from './document-file-icon';
import { DocumentStatusBadge } from './document-status-badge';
import { DOCUMENTS_COPY } from './documents-copy';

const LOADING_ROWS = 3;

type TableView = 'loading' | 'error' | 'empty' | 'rows';

interface DocumentsTableProps {
  onUpload: () => void;
}

export function DocumentsTable({ onUpload }: DocumentsTableProps) {
  const documents = useGetAllDocuments();
  const views: Record<TableView, () => ReactNode> = {
    loading: () => <LoadingTable />,
    error: () => <LoadFailure onRetry={() => void documents.refetch()} />,
    empty: () => <EmptyLibrary onUpload={onUpload} />,
    rows: () => <DocumentRows documents={documents.data ?? []} />,
  };
  return (
    <Card.Root variant="outline" bg="bg" overflow="hidden">
      <LibraryHeader documents={documents.data} />
      {views[viewOf(documents.data, documents.isError)]()}
    </Card.Root>
  );
}

function viewOf(
  documents: DocumentSummary[] | undefined,
  isError: boolean,
): TableView {
  if (documents) {
    return documents.length === 0 ? 'empty' : 'rows';
  }
  return isError ? 'error' : 'loading';
}

function LibraryHeader({
  documents,
}: {
  documents: DocumentSummary[] | undefined;
}) {
  return (
    <HStack
      justify="space-between"
      px="5"
      py="3.5"
      borderBottomWidth="1px"
      bg="bg"
    >
      <Text fontWeight="semibold" textStyle="sm">
        {DOCUMENTS_COPY.library.title}
      </Text>
      <LiveIndicator isLive={isAnyBeingRead(documents ?? [])} />
    </HStack>
  );
}

function LiveIndicator({ isLive }: { isLive: boolean }) {
  if (!isLive) {
    return null;
  }
  return (
    <Status.Root
      colorPalette="blue"
      size="sm"
      data-testid="documents-live-indicator"
    >
      <Status.Indicator />
      <Text textStyle="xs" color="fg.muted">
        {DOCUMENTS_COPY.library.live}
      </Text>
    </Status.Root>
  );
}

function DocumentsTableFrame({ children }: { children: ReactNode }) {
  return (
    <Table.ScrollArea>
      <Table.Root
        data-testid="documents-table"
        size="md"
        interactive
        tableLayout="fixed"
      >
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <ColumnHeader>{DOCUMENTS_COPY.columns.name}</ColumnHeader>
            <ColumnHeader width="48">
              {DOCUMENTS_COPY.columns.uploadedAt}
            </ColumnHeader>
            <ColumnHeader width="40">
              {DOCUMENTS_COPY.columns.status}
            </ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>{children}</Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

function ColumnHeader({
  children,
  width,
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <Table.ColumnHeader
      width={width}
      px="5"
      textStyle="xs"
      fontWeight="medium"
      color="fg.muted"
      textTransform="uppercase"
      letterSpacing="wider"
    >
      {children}
    </Table.ColumnHeader>
  );
}

function DocumentRows({ documents }: { documents: DocumentSummary[] }) {
  return (
    <DocumentsTableFrame>
      {documents.map((document) => (
        <DocumentRow key={document.id} document={document} />
      ))}
    </DocumentsTableFrame>
  );
}

function DocumentRow({ document }: { document: DocumentSummary }) {
  return (
    <Table.Row data-testid="documents-table-row">
      <Table.Cell px="5" py="3">
        <HStack gap="3">
          <DocumentFileIcon name={document.name} />
          <Stack gap="0" minW="0">
            <Text
              fontWeight="medium"
              truncate
              data-testid="documents-table-name"
            >
              {document.name}
            </Text>
            <Text textStyle="xs" color="fg.muted">
              {fileKindOf(document.name).label}
            </Text>
          </Stack>
        </HStack>
      </Table.Cell>
      <Table.Cell px="5" py="3">
        <Text
          textStyle="sm"
          color="fg.muted"
          title={formatAbsoluteTime(document.uploadedAt)}
          data-testid="documents-table-uploaded-at"
        >
          {formatRelativeTime(document.uploadedAt)}
        </Text>
      </Table.Cell>
      <Table.Cell px="5" py="3">
        <DocumentStatusBadge
          status={document.status}
          data-testid="documents-table-status"
        />
      </Table.Cell>
    </Table.Row>
  );
}

function LoadingTable() {
  return (
    <Box
      data-testid="documents-loading-state"
      aria-busy="true"
      aria-label={DOCUMENTS_COPY.loading}
    >
      <DocumentsTableFrame>
        {Array.from({ length: LOADING_ROWS }, (_, row) => (
          <Table.Row key={row}>
            <Table.Cell px="5" py="3">
              <HStack gap="3">
                <SkeletonCircle size="9" />
                <Skeleton height="4" width="40" />
              </HStack>
            </Table.Cell>
            <Table.Cell px="5" py="3">
              <Skeleton height="4" width="24" />
            </Table.Cell>
            <Table.Cell px="5" py="3">
              <Skeleton height="6" width="24" rounded="full" />
            </Table.Cell>
          </Table.Row>
        ))}
      </DocumentsTableFrame>
    </Box>
  );
}

function LoadFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <Box p="5">
      <Alert.Root status="error" data-testid="documents-error-state">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{DOCUMENTS_COPY.error.title}</Alert.Title>
          <Alert.Description>
            {DOCUMENTS_COPY.error.description}
          </Alert.Description>
        </Alert.Content>
        <Button
          size="sm"
          variant="outline"
          alignSelf="center"
          onClick={onRetry}
          data-testid="documents-retry-button"
        >
          <LuRefreshCw />
          {DOCUMENTS_COPY.retry}
        </Button>
      </Alert.Root>
    </Box>
  );
}

function EmptyLibrary({ onUpload }: DocumentsTableProps) {
  return (
    <EmptyState.Root py="16" data-testid="documents-empty-state">
      <EmptyState.Content>
        <EmptyState.Indicator>
          <LuInbox />
        </EmptyState.Indicator>
        <Stack textAlign="center" gap="1">
          <EmptyState.Title>{DOCUMENTS_COPY.empty.title}</EmptyState.Title>
          <EmptyState.Description>
            {DOCUMENTS_COPY.empty.description}
          </EmptyState.Description>
        </Stack>
        <Button
          colorPalette={BRAND_PALETTE}
          onClick={onUpload}
          data-testid="documents-empty-upload-button"
        >
          <LuUpload />
          {DOCUMENTS_COPY.upload}
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
