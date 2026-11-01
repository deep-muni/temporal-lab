import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatRelativeTime(isoTimestamp: string): string {
  return formatDistanceToNow(parseISO(isoTimestamp), { addSuffix: true });
}
