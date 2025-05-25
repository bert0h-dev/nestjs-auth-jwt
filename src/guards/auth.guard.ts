import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { PayloadDto } from 'src/auth/dto/payload.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Obtener el request de la peticion
    const request: Request = context.switchToHttp().getRequest();
    // Obtener el token de la peticion
    const token = this.extractTokenFromHeader(request);

    // Si no hay token, no se permite el acceso
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verificar el token
    try {
      const payload = this.jwtService.verify(token);
      // Si el token es valido, se guarda el payload en el request
      request['user'] = this.extractPayload(payload);
    } catch (error) {
      Logger.error('Error al verificar el token', error.message);
      // Si el token no es valido, no se permite el acceso
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  /**
   * Extrae el token del header de la peticion
   * @param request Request de la peticion
   * @description Verifica si se encuentra el header de autorizacion y extrae el token
   * @returns El token o null si no existe
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    return token || null;
  }

  /**
   * Extrae el payload del token
   * @param payload Payload del token
   * @description Extrae el userId del payload y lo devuelve en un DTO
   * @returns Un objeto de tipo PayloadDto
   */
  private extractPayload(payload): PayloadDto {
    return {
      userId: payload.userId,
    };
  }
}
