import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@src/generated/prisma/client';
import { DatabaseConfig } from './database.config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(DatabaseConfig) config: DatabaseConfig) {
    super({ adapter: createPgAdapter(config), log: ['warn', 'error'] });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

function createPgAdapter(config: DatabaseConfig): PrismaPg {
  return new PrismaPg({
    connectionString: config.url,
    max: config.poolMax,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    statement_timeout: config.statementTimeoutMs,
    application_name: config.applicationName,
  });
}
