export const EMBEDDING_DIMENSIONS = 1024;

export interface PendingChunk {
  id: string;
  text: string;
}

export interface EmbeddedChunk {
  id: string;
  embedding: number[];
}

export function toEmbeddedChunks(
  chunks: PendingChunk[],
  embeddings: number[][],
): EmbeddedChunk[] {
  assertOneEmbeddingPerChunk(chunks, embeddings);
  return chunks.map((chunk, index) => ({
    id: chunk.id,
    embedding: embeddings[index],
  }));
}

function assertOneEmbeddingPerChunk(
  chunks: PendingChunk[],
  embeddings: number[][],
): void {
  const hasWrongSize = embeddings.some(
    (embedding) => embedding.length !== EMBEDDING_DIMENSIONS,
  );
  if (embeddings.length !== chunks.length || hasWrongSize) {
    throw new Error(
      `Expected ${chunks.length} embeddings of ${EMBEDDING_DIMENSIONS} dimensions from the embedding model`,
    );
  }
}
