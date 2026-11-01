import { UnreadableDocumentError } from '@src/documents/domain/errors/documents.errors';

const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true });

export function toDocumentText(content: Uint8Array): string {
  const text = decodeUtf8(content);
  if (text.trim().length === 0) {
    throw new UnreadableDocumentError('The document has no text');
  }
  return text;
}

function decodeUtf8(content: Uint8Array): string {
  try {
    return STRICT_UTF8.decode(content);
  } catch {
    throw new UnreadableDocumentError('The document is not valid UTF-8 text');
  }
}
