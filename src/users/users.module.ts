import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SchemaService } from 'src/schema/schema.service';
import { MailService } from 'src/services/mail.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SchemaService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
