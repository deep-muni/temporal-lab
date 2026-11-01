'use client';

import { useGetAllDocuments } from '@/data/documents/query/use-get-all-documents';
import {
  summarizeDocuments,
  type DocumentsSummary,
} from '@/data/documents/summarize-documents';
import { Card, SimpleGrid, Skeleton, Stat } from '@chakra-ui/react';
import { DOCUMENTS_COPY } from './documents-copy';

const STATS: { key: keyof DocumentsSummary; color: string }[] = [
  { key: 'total', color: 'fg' },
  { key: 'processing', color: 'blue.fg' },
  { key: 'ready', color: 'green.fg' },
  { key: 'failed', color: 'red.fg' },
];

export function DocumentsOverview() {
  const { data } = useGetAllDocuments();
  const summary = data ? summarizeDocuments(data) : undefined;

  return (
    <SimpleGrid
      columns={{ base: 2, md: 4 }}
      gap="4"
      data-testid="documents-overview"
    >
      {STATS.map(({ key, color }) => (
        <Card.Root key={key} variant="outline" bg="bg">
          <Card.Body py="4" px="5">
            <Stat.Root>
              <Stat.Label>{DOCUMENTS_COPY.summary[key]}</Stat.Label>
              <Skeleton loading={!summary} width="fit-content">
                <Stat.ValueText
                  color={summary?.[key] ? color : 'fg.muted'}
                  data-testid={`documents-overview-${key}`}
                >
                  {summary?.[key] ?? 0}
                </Stat.ValueText>
              </Skeleton>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      ))}
    </SimpleGrid>
  );
}
