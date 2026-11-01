import type { TransactionalContextPort } from '@src/documents/domain/ports/transactional-context.port';

export class InMemoryTransactionalContextAdapter implements TransactionalContextPort {
  run<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
