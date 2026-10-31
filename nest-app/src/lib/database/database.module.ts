import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma.module.js';
import { PrismaService } from './prisma.service.js';

const TRANSACTION_TIMEOUT_MS = 10_000;
const TRANSACTION_MAX_WAIT_MS = 5_000;

@Module({
  imports: [
    PrismaModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
            defaultTxOptions: {
              timeout: TRANSACTION_TIMEOUT_MS,
              maxWait: TRANSACTION_MAX_WAIT_MS,
            },
          }),
        }),
      ],
    }),
  ],
})
export class DatabaseModule {}
