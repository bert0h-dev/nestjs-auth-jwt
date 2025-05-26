import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { SchemaService } from 'src/schema/schema.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, SchemaService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
