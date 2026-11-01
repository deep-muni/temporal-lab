import { EmbeddingConfig } from './embedding.config';

describe('embedding configuration', () => {
  it('embeds 16 texts per request, two requests at a time, retrying twice by default', () => {
    expect(EmbeddingConfig.fromEnv({})).toEqual({
      batchSize: 16,
      concurrency: 2,
      maxRetries: 2,
      retryDelayMs: 1_000,
    });
  });

  it('refuses to embed with no requests in flight', () => {
    expect(() =>
      EmbeddingConfig.fromEnv({ EMBEDDING_CONCURRENCY: '0' }),
    ).toThrow(/EMBEDDING_CONCURRENCY/);
  });
});
