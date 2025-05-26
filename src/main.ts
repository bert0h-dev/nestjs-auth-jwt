import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Se configura el Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo permite propiedades que están en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
    })
  );

  // Se configuran los Guards globales
  app.useGlobalGuards(app.get(AuthenticationGuard));
  app.useGlobalGuards(app.get(AuthorizationGuard));

  await app.listen(config.get('BACKEND_PORT') ?? 3005);
}
bootstrap();
