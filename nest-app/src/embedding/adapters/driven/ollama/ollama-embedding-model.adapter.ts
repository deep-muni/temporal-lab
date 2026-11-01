import { Inject, Injectable } from '@nestjs/common';
import type { EmbeddingModelPort } from '@src/embedding/domain/ports/embedding-model.port';
import { OllamaConfig } from '@src/embedding/infrastructure/ollama.config';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaEmbeddingModelAdapter implements EmbeddingModelPort {
  constructor(
    @Inject(Ollama) private readonly ollama: Ollama,
    @Inject(OllamaConfig) private readonly config: OllamaConfig,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const { embeddings } = await this.ollama.embed({
      model: this.config.embeddingModel,
      input: texts,
      truncate: false,
    });
    return embeddings;
  }
}
