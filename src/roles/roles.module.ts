import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SchemaService } from 'src/schema/schema.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, SchemaService],
  exports: [RolesService],
})
export class RolesModule {}
