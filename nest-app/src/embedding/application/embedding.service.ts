import { Inject, Injectable } from '@nestjs/common';
import {
  EMBEDDING_MODEL_PORT,
  type EmbeddingModelPort,
} from '@src/embedding/domain/ports/embedding-model.port';
import { EmbeddingConfig } from '@src/embedding/infrastructure/embedding.config';
import {
  defer,
  from,
  lastValueFrom,
  map,
  mergeMap,
  retry,
  timer,
  toArray,
  type Observable,
} from 'rxjs';

interface EmbeddedBatch {
  index: number;
  embeddings: number[][];
}

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(EMBEDDING_MODEL_PORT) private readonly model: EmbeddingModelPort,
    @Inject(EmbeddingConfig) private readonly config: EmbeddingConfig,
  ) {}

  embed(texts: string[]): Promise<number[][]> {
    return lastValueFrom(
      from(inBatchesOf(texts, this.config.batchSize)).pipe(
        mergeMap(
          (batch, index) =>
            this.embedWithRetries(batch).pipe(
              map((embeddings): EmbeddedBatch => ({ index, embeddings })),
            ),
          this.config.concurrency,
        ),
        toArray(),
        map(inBatchOrder),
      ),
    );
  }

  private embedWithRetries(batch: string[]): Observable<number[][]> {
    const { maxRetries, retryDelayMs } = this.config;
    return defer(() => this.embedBatch(batch)).pipe(
      retry({
        count: maxRetries,
        delay: (_error, attempt) => timer(retryDelayMs * 2 ** (attempt - 1)),
      }),
    );
  }

  private async embedBatch(batch: string[]): Promise<number[][]> {
    const embeddings = await this.model.embed(batch);
    if (embeddings.length !== batch.length) {
      throw new Error(
        `Embedding model returned ${embeddings.length} embeddings for ${batch.length} texts`,
      );
    }
    return embeddings;
  }
}

function inBatchesOf(texts: string[], size: number): string[][] {
  return Array.from({ length: Math.ceil(texts.length / size) }, (_, index) =>
    texts.slice(index * size, (index + 1) * size),
  );
}

function inBatchOrder(batches: EmbeddedBatch[]): number[][] {
  return batches
    .toSorted((a, b) => a.index - b.index)
    .flatMap((batch) => batch.embeddings);
}
