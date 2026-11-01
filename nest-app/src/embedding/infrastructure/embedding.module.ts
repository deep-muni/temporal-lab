import { Module } from '@nestjs/common';
import { OllamaEmbeddingModelAdapter } from '@src/embedding/adapters/driven/ollama/ollama-embedding-model.adapter';
import { EmbeddingService } from '@src/embedding/application/embedding.service';
import { EMBEDDING_MODEL_PORT } from '@src/embedding/domain/ports/embedding-model.port';
import { Ollama } from 'ollama';
import { EmbeddingConfig } from './embedding.config';
import { OllamaConfig } from './ollama.config';

@Module({
  providers: [
    {
      provide: EmbeddingConfig,
      useFactory: () => EmbeddingConfig.fromEnv(process.env),
    },
    {
      provide: OllamaConfig,
      useFactory: () => OllamaConfig.fromEnv(process.env),
    },
    {
      provide: Ollama,
      inject: [OllamaConfig],
      useFactory: (config: OllamaConfig) =>
        new Ollama({
          host: config.host,
          fetch: fetchWithTimeout(config.requestTimeoutMs),
        }),
    },
    { provide: EMBEDDING_MODEL_PORT, useClass: OllamaEmbeddingModelAdapter },
    EmbeddingService,
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}

function fetchWithTimeout(timeoutMs: number): typeof fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeout])
      : timeout;
    return fetch(input, { ...init, signal });
  };
}
