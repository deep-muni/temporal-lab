import type { DocumentStatus } from '@/data/documents/document.schema';
import { Badge, type BadgeProps } from '@chakra-ui/react';
import { STATUS_VIEW } from './documents-copy';

export function DocumentStatusBadge({
  status,
  ...rest
}: { status: DocumentStatus } & BadgeProps) {
  const view = STATUS_VIEW[status];
  return (
    <Badge colorPalette={view.colorPalette} {...rest}>
      {view.label}
    </Badge>
  );
}
