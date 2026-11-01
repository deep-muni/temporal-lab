import { FileNotFoundError } from '@src/file-storage/domain/errors/file-storage.errors';
import { InMemoryFileStoreAdapter } from '@src/file-storage/testing/in-memory-file-store.adapter';
import { FileStorageService } from './file-storage.service';

const CONTAINER = 'documents';
const NOTES = {
  name: 'a1/notes.txt',
  contentType: 'text/plain',
  content: new TextEncoder().encode('Temporal keeps work durable.'),
};

function setUp() {
  return new FileStorageService(new InMemoryFileStoreAdapter());
}

describe('storing files', () => {
  it('reads back exactly what was saved', async () => {
    const storage = setUp();

    await storage.save(CONTAINER, NOTES);

    await expect(storage.read(CONTAINER, NOTES.name)).resolves.toEqual(
      NOTES.content,
    );
  });

  it('reports a file that was never saved as not found', async () => {
    const storage = setUp();

    await expect(storage.read(CONTAINER, NOTES.name)).rejects.toThrow(
      new FileNotFoundError(CONTAINER, NOTES.name),
    );
  });

  it('keeps files in one container apart from another', async () => {
    const storage = setUp();
    await storage.save(CONTAINER, NOTES);

    await expect(storage.read('archive', NOTES.name)).rejects.toThrow(
      FileNotFoundError,
    );
  });

  it('forgets a deleted file', async () => {
    const storage = setUp();
    await storage.save(CONTAINER, NOTES);

    await storage.delete(CONTAINER, NOTES.name);

    await expect(storage.read(CONTAINER, NOTES.name)).rejects.toThrow(
      FileNotFoundError,
    );
  });

  it('treats deleting a missing file as done', async () => {
    const storage = setUp();

    await expect(
      storage.delete(CONTAINER, NOTES.name),
    ).resolves.toBeUndefined();
  });
});
