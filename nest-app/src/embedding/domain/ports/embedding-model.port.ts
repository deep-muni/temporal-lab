export const EMBEDDING_MODEL_PORT = Symbol('EMBEDDING_MODEL_PORT');

export interface EmbeddingModelPort {
  embed(texts: string[]): Promise<number[][]>;
}
