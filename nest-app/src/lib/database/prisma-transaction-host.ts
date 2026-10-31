import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import type { PrismaService } from './prisma.service.js';

export type PrismaTransactionHost = TransactionHost<
  TransactionalAdapterPrisma<PrismaService>
>;
