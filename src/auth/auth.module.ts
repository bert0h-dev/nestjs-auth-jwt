import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { SchemaService } from 'src/schema/schema.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, SchemaService],
})
export class AuthModule {}
