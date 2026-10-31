import { Module } from '@nestjs/common';
import { DatabaseModule } from './lib/database/database.module.js';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
