import { InjectTransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import type { TransactionalContextPort } from '@src/documents/domain/ports/transactional-context.port';
import type { PrismaTransactionHost } from '@src/lib/database/prisma-transaction-host';

@Injectable()
export class ClsTransactionalContextAdapter implements TransactionalContextPort {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: PrismaTransactionHost,
  ) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.txHost.withTransaction(work);
  }
}
