import * as bcrypt from 'bcrypt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { SchemaService } from 'src/schema/schema.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PayloadDto } from './dto/payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private schemaService: SchemaService,
    private jwtService: JwtService
  ) {}

  /**
   * Metodo para iniciar sesion
   * @param body DTO de login
   * @description Inicia sesion y genera un token de acceso y un refresh token
   * @throws UnauthorizedException si las credenciales son incorrectas
   */
  async login(loginData: LoginDto) {
    const { email, password } = loginData;

    // Validamos que el email exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userObj) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Validamos que la contraseña sea correcta
    const isPasswordValid = await bcrypt.compare(password, userObj.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Generamos un nuevo token de acceso y refresh token
    return await this.generateUserToken(userObj);
  }

  /**
   * Metodo para refrescar el token de acceso
   * @param body DTO de refresh token
   * @description Refresca el token de acceso y genera un nuevo refresh token
   * @throws UnauthorizedException si el refresh token es invalido o ha expirado
   */
  async refreshToken(refreshTokenData: RefreshTokenDto) {
    const { refreshToken } = refreshTokenData;

    // Validamos que el refresh token exista
    const tokenObj = await this.schemaService.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });
    if (!tokenObj) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verificamos que el refresh token no haya expirado
    if (tokenObj.expirationDate < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generamos un nuevo token de acceso
    const user = await this.schemaService.user.findUnique({
      where: {
        id: tokenObj.userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generamos un nuevo token de acceso y refresh token
    return await this.generateUserToken(user);
  }

  /**
   * Metodo para generar el token de acceso y el refresh token
   * @param user Objeto de usuario
   * @description Genera el token de acceso y el refresh token
   * @returns Objeto con el access token y el refresh token
   */
  async generateUserToken(user: User) {
    // Generamos la constante para el payload del JWT
    const payload: PayloadDto = { userId: user.id };
    // Obtenemos el access token
    const accessToken = this.jwtService.sign(payload);
    //Obtenemos el refresh token
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Antes de retornar el token, guardamos el refresh token en la base de datos
    await this.storeRefreshToken(refreshToken, user.id);

    // Retornamos el access token y el refresh token
    // El access token tiene una expiracion de 1 hora (config en el .env)
    // El refresh token tiene una expiracion de 7 dias
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Metodo para guardar el refresh token en la base de datos
   * @param token Token de refresco
   * @param userId ID del usuario
   * @description Guarda el refresh token en la base de datos
   */
  async storeRefreshToken(token: string, userId: number) {
    //Se genera la fecha de expiracion del token
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    // Si el token no existe lo crea
    // Si el token ya existe lo actualiza
    await this.schemaService.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expirationDate,
      },
      create: {
        userId,
        token,
        expirationDate,
      },
    });
  }
}
