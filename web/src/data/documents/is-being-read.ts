import type { DocumentStatus } from './document.schema';

const BEING_READ: Record<DocumentStatus, boolean> = {
  uploaded: true,
  processing: true,
  ready: false,
  failed: false,
};

export function isBeingRead(status: DocumentStatus): boolean {
  return BEING_READ[status];
}
