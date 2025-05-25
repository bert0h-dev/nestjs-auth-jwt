import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersService } from 'src/users/users.service';
import { SchemaService } from 'src/schema/schema.service';
import { MailService } from 'src/services/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, SchemaService, MailService],
})
export class AuthModule {}
