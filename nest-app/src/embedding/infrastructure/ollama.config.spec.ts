import { OllamaConfig } from './ollama.config';

const LOCAL_OLLAMA = {
  OLLAMA_HOST: 'http://127.0.0.1:11434',
  OLLAMA_EMBEDDING_MODEL: 'qwen3-embedding:0.6b',
};

describe('Ollama configuration', () => {
  it('gives up on an Ollama request after 30 seconds by default', () => {
    expect(OllamaConfig.fromEnv(LOCAL_OLLAMA)).toEqual({
      host: 'http://127.0.0.1:11434',
      embeddingModel: 'qwen3-embedding:0.6b',
      requestTimeoutMs: 30_000,
    });
  });

  it('refuses to start without an Ollama host', () => {
    expect(() =>
      OllamaConfig.fromEnv({ OLLAMA_EMBEDDING_MODEL: 'qwen3-embedding:0.6b' }),
    ).toThrow(/OLLAMA_HOST/);
  });

  it('refuses to start without an embedding model', () => {
    expect(() =>
      OllamaConfig.fromEnv({ OLLAMA_HOST: 'http://127.0.0.1:11434' }),
    ).toThrow(/OLLAMA_EMBEDDING_MODEL is required/);
  });

  it('refuses a host that is not an http address', () => {
    expect(() =>
      OllamaConfig.fromEnv({ ...LOCAL_OLLAMA, OLLAMA_HOST: 'ollama:11434' }),
    ).toThrow(/OLLAMA_HOST must be an http\(s\) URL/);
  });
});
