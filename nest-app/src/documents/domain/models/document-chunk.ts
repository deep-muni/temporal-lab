export const EMBEDDING_DIMENSIONS = 1024;

export interface DocumentChunk {
  position: number;
  text: string;
  embedding: number[];
}

export function toDocumentChunks(
  texts: string[],
  embeddings: number[][],
): DocumentChunk[] {
  assertOneEmbeddingPerText(texts, embeddings);
  return texts.map((text, position) => ({
    position,
    text,
    embedding: embeddings[position],
  }));
}

function assertOneEmbeddingPerText(
  texts: string[],
  embeddings: number[][],
): void {
  const hasWrongSize = embeddings.some(
    (embedding) => embedding.length !== EMBEDDING_DIMENSIONS,
  );
  if (embeddings.length !== texts.length || hasWrongSize) {
    throw new Error(
      `Expected ${texts.length} embeddings of ${EMBEDDING_DIMENSIONS} dimensions from the embedding model`,
    );
  }
}
