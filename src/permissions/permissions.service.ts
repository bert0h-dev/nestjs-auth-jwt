import { Injectable, NotFoundException } from '@nestjs/common';
import { SchemaService } from 'src/schema/schema.service';
import { PermissionDTO } from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private schemaService: SchemaService) {}

  /**
   * Metodo para obtener los permisos efectivos de un usuario.
   * @param userId ID del usuario del cual se quieren obtener los permisos.
   * @returns Un array de objetos que representan los permisos efectivos del usuario.
   * @throws NotFoundException Si el usuario no existe.
   */
  async getEffectivePermissions(userId: number) {
    const userObj = await this.schemaService.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    // Si el usuario tiene el rol de administrador, se le asignan todos los permisos
    if (userObj.role?.name.toLowerCase() === 'admin') {
      return [{ module: '*', action: '*' }];
    }

    // Se obtienen los permisos del rol del usuario
    const rolePerms =
      userObj.role?.rolePermissions.map((rp) => rp.permission) ?? [];
    // Se obtienen los permisos del usuario directamente
    const userPerms = userObj.userPermissions.map((up) => up.permission);
    // Se combinan los permisos del rol y del usuario
    const effectivePermissions = [...rolePerms, ...userPerms];

    // Se eliminan los permisos duplicados
    const uniquePermissions = Array.from(
      new Map(
        effectivePermissions.map((perm) => [
          `${perm.module}:${perm.action}`,
          { module: perm.module, action: perm.action },
        ])
      ).values()
    );

    return uniquePermissions;
  }

  /**
   * Metodo para verificar si un usuario tiene un permiso específico.
   * @param userId ID del usuario.
   * @param module Módulo del permiso.
   * @param action Acción del permiso.
   * @returns Un booleano que indica si el usuario tiene el permiso.
   */
  async userHasPermission(
    userId: number,
    module: string,
    action: string
  ): Promise<boolean> {
    const userPerms = await this.getEffectivePermissions(userId);

    return userPerms.some(
      (perm) =>
        (perm.module === module || perm.module === '*') &&
        (perm.action === action || perm.action === '*')
    );
  }

  /**
   * Metodo para verificar si un conjunto de permisos contiene un permiso específico.
   * @param perms Array de permisos.
   * @param module Módulo del permiso.
   * @param action Acción del permiso.
   * @returns Un booleano que indica si el conjunto de permisos contiene el permiso.
   */
  hasPermission(
    perms: PermissionDTO[],
    module: string,
    action: string
  ): boolean {
    return perms.some(
      (perm) =>
        (perm.module === module || perm.module === '*') &&
        (perm.action === action || perm.action === '*')
    );
  }
}
