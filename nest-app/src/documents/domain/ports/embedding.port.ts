export const EMBEDDING_PORT = Symbol('EMBEDDING_PORT');

export interface EmbeddingPort {
  embed(texts: string[]): Promise<number[][]>;
}
