import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('ChatSphere API')
    .setDescription('Real-time chat application API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🚀 ChatSphere API running on http://localhost:3000');
  console.log('📚 API Docs available at http://localhost:3000/api/docs');
}
bootstrap();