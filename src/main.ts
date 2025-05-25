import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo permite propiedades que están en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
    })
  );
  await app.listen(config.get('BACKEND_PORT') ?? 3005);
}
bootstrap();
