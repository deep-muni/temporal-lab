'use client';

import type { DocumentSummary } from '@/data/documents/document.schema';
import { useGetAllDocuments } from '@/data/documents/query/use-get-all-documents';
import { formatRelativeTime } from '@/lib/date/format-relative-time';
import {
  Alert,
  Button,
  EmptyState,
  Skeleton,
  Table,
  VStack,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
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
  return views[viewOf(documents.data, documents.isError)]();
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

function DocumentsTableFrame({ children }: { children: ReactNode }) {
  return (
    <Table.Root data-testid="documents-table" variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>{DOCUMENTS_COPY.columns.name}</Table.ColumnHeader>
          <Table.ColumnHeader>
            {DOCUMENTS_COPY.columns.uploadedAt}
          </Table.ColumnHeader>
          <Table.ColumnHeader>
            {DOCUMENTS_COPY.columns.status}
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table.Root>
  );
}

function DocumentRows({ documents }: { documents: DocumentSummary[] }) {
  return (
    <DocumentsTableFrame>
      {documents.map((document) => (
        <Table.Row key={document.id} data-testid="documents-table-row">
          <Table.Cell data-testid="documents-table-name">
            {document.name}
          </Table.Cell>
          <Table.Cell data-testid="documents-table-uploaded-at">
            {formatRelativeTime(document.uploadedAt)}
          </Table.Cell>
          <Table.Cell>
            <DocumentStatusBadge
              status={document.status}
              data-testid="documents-table-status"
            />
          </Table.Cell>
        </Table.Row>
      ))}
    </DocumentsTableFrame>
  );
}

function LoadingTable() {
  return (
    <VStack
      align="stretch"
      data-testid="documents-loading-state"
      aria-busy="true"
      aria-label={DOCUMENTS_COPY.loading}
    >
      <DocumentsTableFrame>
        {Array.from({ length: LOADING_ROWS }, (_, row) => (
          <Table.Row key={row}>
            <Table.Cell>
              <Skeleton height="5" />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height="5" />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height="5" />
            </Table.Cell>
          </Table.Row>
        ))}
      </DocumentsTableFrame>
    </VStack>
  );
}

function LoadFailure({ onRetry }: { onRetry: () => void }) {
  return (
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
        onClick={onRetry}
        data-testid="documents-retry-button"
      >
        {DOCUMENTS_COPY.retry}
      </Button>
    </Alert.Root>
  );
}

function EmptyLibrary({ onUpload }: DocumentsTableProps) {
  return (
    <EmptyState.Root data-testid="documents-empty-state">
      <EmptyState.Content>
        <EmptyState.Title>{DOCUMENTS_COPY.empty.title}</EmptyState.Title>
        <EmptyState.Description>
          {DOCUMENTS_COPY.empty.description}
        </EmptyState.Description>
        <Button onClick={onUpload} data-testid="documents-empty-upload-button">
          {DOCUMENTS_COPY.upload}
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
