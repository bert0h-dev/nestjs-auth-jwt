import { BadRequestException, Injectable } from '@nestjs/common';
import { SchemaService } from 'src/schema/schema.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private schemaService: SchemaService) {}

  basicRoleSelect = {
    id: true,
    name: true,
    description: true,
    IsSystemRole: true,
  };

  basicPermissionSelect = {
    id: true,
    module: true,
    action: true,
    description: true,
  };

  /**
   * Metodo para obtener todos los roles
   * @returns Un array de objetos que representan los roles disponibles en la base de datos.
   * @description Obtiene todos los roles existentes en la base de datos.
   * @throws BadRequestException Si no se encuentran roles.
   */
  async getAllRoles() {
    // Se obtienen todos los roles de la base de datos
    const roles = await this.schemaService.role.findMany({
      select: {
        ...this.basicRoleSelect,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Si no se encuentran roles, se lanza una excepción
    if (!roles || roles.length === 0) {
      throw new BadRequestException('No roles found');
    }

    return roles;
  }

  /**
   * Metodo para obtener un rol por su ID
   * @param roleId ID del rol a buscar
   * @returns Un objeto que representa el rol encontrado.
   * @description Obtiene un rol específico de la base de datos utilizando su ID.
   * @throws BadRequestException Si no se encuentra el rol.
   */
  async getRoleById(roleId: number) {
    // Se busca el rol por su ID
    const roleObj = await this.schemaService.role.findUnique({
      where: { id: roleId },
      select: {
        ...this.basicRoleSelect,
        rolePermissions: {
          select: {
            permission: {
              select: {
                ...this.basicPermissionSelect,
              },
            },
          },
        },
      },
    });

    // Si no se encuentra el rol, se lanza una excepción
    if (!roleObj) {
      throw new BadRequestException('Role not found');
    }

    return roleObj;
  }

  /**
   * Metodo para crear un nuevo rol
   * @param roleBody DTO del rol a crear
   * @description Crea un nuevo rol en la base de datos, validando que no exista previamente y que los permisos proporcionados sean válidos.
   * @throws BadRequestException Si el rol ya existe o si algunos permisos no son válidos.
   */
  async createRole(roleBody: CreateRoleDto) {
    const { name, description, permissionIds } = roleBody;

    // Verificamos si el rol ya existe
    const existingRole = await this.schemaService.role.findFirst({
      where: {
        name: name.toLowerCase(),
      },
    });

    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    // Validamos permisos si se proporcionan
    if (permissionIds.length) {
      const foundPerms = await this.schemaService.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (foundPerms.length !== permissionIds.length) {
        throw new BadRequestException('Some permissions do not exist');
      }
    }

    // Guardamos el nuevo rol en la base de datos
    await this.schemaService.role.create({
      data: {
        name: name.toLowerCase(),
        description: description,
        rolePermissions: {
          create: permissionIds.map((permId) => ({
            permission: { connect: { id: permId } },
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Metodo para actualizar un rol existente
   * @param roleId ID del rol a actualizar
   * @param roleBody DTO con los nuevos datos del rol
   * @description Actualiza un rol existente, validando que el rol exista, que no sea un rol del sistema y que los permisos proporcionados sean válidos.
   * @throws BadRequestException Si el rol no existe, si es un rol del sistema, si el nombre ya está en uso o si algunos permisos no son válidos.
   */
  async updateRole(roleId: number, roleBody: UpdateRoleDto) {
    //Se valida que el rol exista
    const roleObj = await this.schemaService.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: true,
      },
    });

    if (!roleObj) {
      throw new BadRequestException('Role not found');
    }
    if (roleObj.IsSystemRole) {
      throw new BadRequestException('Cannot update system role');
    }

    const { name, description, permissionIds } = roleBody;

    // Validamos que el nombre no este duplicado
    const otherRole = await this.schemaService.role.findFirst({
      where: {
        id: { not: roleId },
        name: name.toLowerCase(),
      },
    });

    if (otherRole) {
      throw new BadRequestException('Role name already exists');
    }

    // Validamos que los permisos existan
    if (permissionIds.length) {
      const foundPerms = await this.schemaService.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (foundPerms.length !== permissionIds.length) {
        throw new BadRequestException('Some permissions do not exist');
      }
    }

    // Validamos si se agregaron o eliminaron permisos
    const currentPermissionIds = roleObj.rolePermissions.map(
      (rp) => rp.permissionId
    );
    const incomingPermissionIds = permissionIds || [];

    const toAdd = incomingPermissionIds.filter(
      (id) => !currentPermissionIds.includes(id)
    );
    const toRemove = currentPermissionIds.filter(
      (id) => !incomingPermissionIds.includes(id)
    );

    // Se actualiza el rol con todos sus permisos
    await this.schemaService.$transaction([
      this.schemaService.role.update({
        where: { id: roleId },
        data: {
          name: name.toLowerCase(),
          description: description,
        },
      }),

      // Se eliminan los permisos que ya no estan
      ...toRemove.map((permId) =>
        this.schemaService.rolePermission.deleteMany({
          where: { roleId: roleId, permissionId: permId },
        })
      ),

      // Se agregan los nuevos permisos
      ...toAdd.map((permId) =>
        this.schemaService.rolePermission.create({
          data: { roleId: roleId, permissionId: permId },
        })
      ),
    ]);
  }
}
