import type { EmbeddingModelPort } from '@src/embedding/domain/ports/embedding-model.port';

const DEFAULT_DIMENSIONS = 3;

export function embeddingOf(text: string): number[] {
  return sizedEmbeddingOf(text, DEFAULT_DIMENSIONS);
}

function sizedEmbeddingOf(text: string, dimensions: number): number[] {
  return Array.from({ length: dimensions }, (_, index) =>
    index === 0 ? text.length : 0,
  );
}

export class InMemoryEmbeddingModelAdapter implements EmbeddingModelPort {
  readonly batches: string[][] = [];
  private failuresLeft = 0;
  private failure = new Error('embedding model unavailable');
  private firstBatchDelayMs = 0;

  constructor(private readonly dimensions = DEFAULT_DIMENSIONS) {}

  failNextCalls(times: number, error: Error): void {
    this.failuresLeft = times;
    this.failure = error;
  }

  delayFirstBatchBy(delayMs: number): void {
    this.firstBatchDelayMs = delayMs;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (this.failuresLeft > 0) {
      this.failuresLeft -= 1;
      throw this.failure;
    }
    const isFirstBatch = this.batches.length === 0;
    this.batches.push(texts);
    if (isFirstBatch && this.firstBatchDelayMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.firstBatchDelayMs),
      );
    }
    return texts.map((text) => sizedEmbeddingOf(text, this.dimensions));
  }
}
