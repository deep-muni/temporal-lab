import type { TextChunkerPort } from '@src/documents/domain/ports/text-chunker.port';

const BLANK_LINE = /\n\s*\n/;

export class InMemoryTextChunkerAdapter implements TextChunkerPort {
  readonly requests: { text: string; contentType: string }[] = [];

  split(text: string, contentType: string): Promise<string[]> {
    this.requests.push({ text, contentType });
    return Promise.resolve(text.split(BLANK_LINE));
  }
}
