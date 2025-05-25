import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SchemaService } from 'src/schema/schema.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SchemaService],
  exports: [UsersService],
})
export class UsersModule {}
