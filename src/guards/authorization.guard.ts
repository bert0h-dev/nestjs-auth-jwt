import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsService } from 'src/permissions/permissions.service';

import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Validamos si el endpoint es publico
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Si el endpoint es publico, no se requiere autorizacion
    if (isPublic) {
      return true;
    }

    // Se obtiene el request para obtener el usuerio autenticado
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Se obtiene el permiso requerido del decorador
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    //Si no requiere permisos, se permite el acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Se obtienen los permisos efectivos del usuario
    const effectivePermissions =
      await this.permissionService.getEffectivePermissions(user.userId);

    // Se verifica si el usuario tiene los permisos requeridos
    const hasAll = requiredPermissions.every((perm) => {
      const [module, action] = perm.split(':');
      return this.permissionService.hasPermission(
        effectivePermissions,
        module,
        action
      );
    });

    // Si el usuario no tiene los permisos requeridos, se lanza una excepcion
    if (!hasAll) {
      throw new ForbiddenException('User does not have required permissions');
    }

    return true;
  }
}
