import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strips properties not in the DTO
    forbidNonWhitelisted: true, // throws error if extra properties sent
    transform: true,        // auto-converts payloads to DTO instances
  }));

  app.enableCors(); // allow Next.js frontend to call this API
  await app.listen(3000);
}
bootstrap();