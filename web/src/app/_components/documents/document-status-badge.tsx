import type { DocumentStatus } from '@/data/documents/document.schema';
import { Badge, Icon, type BadgeProps } from '@chakra-ui/react';
import { STATUS_VIEW } from './documents-copy';

export function DocumentStatusBadge({
  status,
  ...rest
}: { status: DocumentStatus } & BadgeProps) {
  const view = STATUS_VIEW[status];
  return (
    <Badge
      colorPalette={view.colorPalette}
      variant="subtle"
      size="md"
      rounded="full"
      gap="1.5"
      px="2.5"
      {...rest}
    >
      <Icon
        as={view.icon}
        boxSize="3.5"
        aria-hidden
        animation={view.isWorking ? 'spin 1.2s linear infinite' : undefined}
        _motionReduce={{ animation: 'none' }}
      />
      {view.label}
    </Badge>
  );
}
