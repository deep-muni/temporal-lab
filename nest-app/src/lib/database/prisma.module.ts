import { Global, Module } from '@nestjs/common';
import { DatabaseConfig } from './database.config.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    {
      provide: DatabaseConfig,
      useFactory: () => DatabaseConfig.fromEnv(process.env),
    },
    PrismaService,
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
