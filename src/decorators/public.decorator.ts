import { SetMetadata } from '@nestjs/common';

/*
 * Decorador Public para marcar rutas como públicas.
 * Esto permite que la ruta sea accedida sin autenticación.
 * Esto permite que la ruta sea accedida sin permisos de roles.
 */

export const IS_PUBLIC_KEY = 'is_public';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
