import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from '@/infra/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://metalizze.vercel.app'
    ],
    credentials: true,
  })

  // Use EnvService to fetch PORT so defaults and validation are applied
  const envService = app.get(EnvService);
  const port = envService.get('PORT') ?? 3000

  const isProduction = envService.get('NODE_ENV') === 'production'

  if (isProduction) {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Metalizze API rodando em PRODUÇÃO na porta ${port}`);
  } else {
    await app.listen(port);
    console.log(`💻 Metalizze API rodando LOCALMENTE em http://localhost:${port}`);
  }
}

bootstrap();
