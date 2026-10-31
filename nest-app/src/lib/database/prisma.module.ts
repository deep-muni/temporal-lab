import { Global, Module } from '@nestjs/common';
import { DatabaseConfig } from './database.config';
import { PrismaService } from './prisma.service';

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
