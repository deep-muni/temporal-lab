import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { HttpConfig } from '@src/lib/http/http.config';

async function bootstrap() {
  const http = HttpConfig.fromEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: http.corsOrigins });
  app.enableShutdownHooks();
  await app.listen(http.port, http.host);
}
void bootstrap();
