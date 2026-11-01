import { Inject, Injectable } from '@nestjs/common';
import type { EmbeddingPort } from '@src/documents/domain/ports/embedding.port';
import { EmbeddingService } from '@src/embedding/application/embedding.service';

@Injectable()
export class EmbeddingServiceAdapter implements EmbeddingPort {
  constructor(
    @Inject(EmbeddingService) private readonly embedding: EmbeddingService,
  ) {}

  embed(texts: string[]): Promise<number[][]> {
    return this.embedding.embed(texts);
  }
}
