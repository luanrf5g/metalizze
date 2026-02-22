import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from '@/infra/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  // Use EnvService to fetch PORT so defaults and validation are applied
  const envService = app.get(EnvService);
  const port = envService.get('PORT') ?? 3000

  await app.listen(port);
}
bootstrap();
