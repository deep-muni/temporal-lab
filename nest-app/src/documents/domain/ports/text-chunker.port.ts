export const TEXT_CHUNKER_PORT = Symbol('TEXT_CHUNKER_PORT');

export interface TextChunkerPort {
  split(text: string, contentType: string): Promise<string[]>;
}
