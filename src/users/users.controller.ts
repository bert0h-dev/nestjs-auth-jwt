import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionsType } from 'src/enums/permissions-type.enum';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(PermissionsType.USER_VIEW)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Permissions(PermissionsType.USER_VIEW)
  @Get('get/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.getUserById(Number(userId));
  }

  @Permissions(PermissionsType.USER_UPDATE)
  @Patch('assign-role')
  assignRole(@Body() bodyDto: AssignRoleDto) {
    return this.usersService.assignRoleToUser(bodyDto);
  }

  @Permissions(PermissionsType.USER_CREATE)
  @Patch('assign-permissions')
  assignPermissions(@Body() bodyDto: AssignPermissionsDto) {
    return this.usersService.assignPermissionsToUser(bodyDto);
  }
}
