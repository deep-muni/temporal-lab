import { describe, expect, it } from 'vitest';
import { isBeingRead } from './is-being-read';

describe('knowing whether a document is still being read', () => {
  it('treats a just-uploaded document as still being read', () => {
    expect(isBeingRead('uploaded')).toBe(true);
  });

  it('treats a processing document as still being read', () => {
    expect(isBeingRead('processing')).toBe(true);
  });

  it('treats a ready document as finished', () => {
    expect(isBeingRead('ready')).toBe(false);
  });

  it('treats a failed document as finished', () => {
    expect(isBeingRead('failed')).toBe(false);
  });
});
