// Imports de librerías
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Imports de archivos propios
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaModule } from './schema/schema.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';
import envConfig from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [envConfig],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (envConfig) => ({
        secret: envConfig.get('jwt.secret'),
        signOptions: {
          expiresIn: envConfig.get('jwt.expiresIn'),
        },
      }),
      global: true,
      inject: [ConfigService],
    }),
    SchemaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthenticationGuard, AuthorizationGuard],
})
export class AppModule {}
