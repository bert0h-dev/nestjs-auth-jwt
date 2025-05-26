import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionsType } from 'src/enums/permissions-type.enum';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  /**
   * Metodo para obtener todos los roles
   * @returns Un array de objetos que representan los roles disponibles en la base de datos.
   * @description Obtiene todos los roles existentes en la base de datos.
   */
  @Permissions(PermissionsType.ROLE_VIEW)
  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Metodo para obtener un rol por su ID
   * @param roleId ID del rol a buscar
   * @returns Un objeto que representa el rol encontrado.
   * @description Obtiene un rol específico de la base de datos utilizando su ID.
   */
  @Permissions(PermissionsType.ROLE_VIEW)
  @Get(':roleId')
  async getRoleById(@Param('roleId') roleId: string) {
    return this.rolesService.getRoleById(Number(roleId));
  }

  /**
   * Metodo para crear un nuevo rol
   * @param roleBody DTO del rol a crear
   * @description Crea un nuevo rol en la base de datos, validando que no exista previamente y que los permisos proporcionados sean válidos.
   */
  // @Permissions(PermissionsType.ROLE_CREATE)
  @Post()
  async createRole(@Body() roleBody: CreateRoleDto) {
    return this.rolesService.createRole(roleBody);
  }

  /**
   * Metodo para actualizar un rol existente
   * @param roleId ID del rol a actualizar
   * @param roleBody DTO del rol a actualizar
   * @description Actualiza un rol existente en la base de datos, validando que el rol exista y que los permisos proporcionados sean válidos.
   */
  @Permissions(PermissionsType.ROLE_UPDATE)
  @Post(':roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() roleBody: UpdateRoleDto
  ) {
    return this.rolesService.updateRole(Number(roleId), roleBody);
  }
}
