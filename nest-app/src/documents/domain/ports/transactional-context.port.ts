export const TRANSACTIONAL_CONTEXT_PORT = Symbol('TRANSACTIONAL_CONTEXT_PORT');

export interface TransactionalContextPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}
