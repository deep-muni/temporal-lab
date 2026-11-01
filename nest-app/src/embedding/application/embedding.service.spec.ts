import { EmbeddingConfig } from '@src/embedding/infrastructure/embedding.config';
import {
  embeddingOf,
  InMemoryEmbeddingModelAdapter,
} from '@src/embedding/testing/in-memory-embedding-model.adapter';
import { EmbeddingService } from './embedding.service';

const TEXTS = ['one', 'two words', 'three is more', 'four', 'five or so'];

const config = EmbeddingConfig.fromEnv({
  EMBEDDING_BATCH_SIZE: '2',
  EMBEDDING_CONCURRENCY: '2',
  EMBEDDING_MAX_RETRIES: '2',
  EMBEDDING_RETRY_DELAY_MS: '0',
});

function setUp() {
  const model = new InMemoryEmbeddingModelAdapter();
  return { model, embedding: new EmbeddingService(model, config) };
}

describe('embedding texts', () => {
  it('embeds nothing when there is no text', async () => {
    const { model, embedding } = setUp();

    await expect(embedding.embed([])).resolves.toEqual([]);
    expect(model.batches).toEqual([]);
  });

  it('embeds a single text in one request', async () => {
    const { model, embedding } = setUp();

    await expect(embedding.embed(['one'])).resolves.toEqual([
      embeddingOf('one'),
    ]);
    expect(model.batches).toEqual([['one']]);
  });

  it('sends many texts in batches and returns embeddings in the order of the texts', async () => {
    const { model, embedding } = setUp();
    model.delayFirstBatchBy(20);

    const embeddings = await embedding.embed(TEXTS);

    expect(model.batches).toEqual([
      ['one', 'two words'],
      ['three is more', 'four'],
      ['five or so'],
    ]);
    expect(embeddings).toEqual(TEXTS.map(embeddingOf));
  });

  it('recovers when the model fails briefly', async () => {
    const { model, embedding } = setUp();
    model.failNextCalls(2, new Error('model busy'));

    await expect(embedding.embed(['one'])).resolves.toEqual([
      embeddingOf('one'),
    ]);
  });

  it('gives up once the model keeps failing past the retry limit', async () => {
    const { model, embedding } = setUp();
    model.failNextCalls(3, new Error('model down'));

    await expect(embedding.embed(['one'])).rejects.toThrow('model down');
  });
});
