import { format, parseISO } from 'date-fns';

export function formatAbsoluteTime(isoTimestamp: string): string {
  return format(parseISO(isoTimestamp), 'd MMM yyyy, HH:mm');
}
