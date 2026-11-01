import { EMBEDDING_DIMENSIONS } from '@src/documents/domain/models/document-chunk';
import type { EmbeddingPort } from '@src/documents/domain/ports/embedding.port';

export function embeddingOf(text: string): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) =>
    index === 0 ? text.length : 0,
  );
}

export class InMemoryEmbeddingAdapter implements EmbeddingPort {
  private nextFailure: Error | undefined;
  private dimensions = EMBEDDING_DIMENSIONS;

  failNextWith(error: Error): void {
    this.nextFailure = error;
  }

  answerWithDimensions(dimensions: number): void {
    this.dimensions = dimensions;
  }

  embed(texts: string[]): Promise<number[][]> {
    const failure = this.nextFailure;
    this.nextFailure = undefined;
    if (failure) {
      return Promise.reject(failure);
    }
    return Promise.resolve(
      texts.map((text) => embeddingOf(text).slice(0, this.dimensions)),
    );
  }
}
