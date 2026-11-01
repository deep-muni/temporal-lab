import { EMBEDDING_DIMENSIONS } from '@src/documents/domain/models/document-chunk';
import type { EmbeddingPort } from '@src/documents/domain/ports/embedding.port';

export function embeddingOf(text: string): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) =>
    index === 0 ? text.length : 0,
  );
}

export class InMemoryEmbeddingAdapter implements EmbeddingPort {
  private nextFailure: Error | undefined;
  private everyCallFailure: Error | undefined;
  private beforeNextEmbed: (() => Promise<unknown>) | undefined;
  private dimensions = EMBEDDING_DIMENSIONS;

  failNextWith(error: Error): void {
    this.nextFailure = error;
  }

  failEveryCallWith(error: Error): void {
    this.everyCallFailure = error;
  }

  runBeforeNextEmbed(action: () => Promise<unknown>): void {
    this.beforeNextEmbed = action;
  }

  answerWithDimensions(dimensions: number): void {
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const action = this.beforeNextEmbed;
    this.beforeNextEmbed = undefined;
    await action?.();
    const failure = this.nextFailure ?? this.everyCallFailure;
    this.nextFailure = undefined;
    if (failure) {
      throw failure;
    }
    return texts.map((text) => embeddingOf(text).slice(0, this.dimensions));
  }
}
