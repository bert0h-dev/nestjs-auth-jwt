import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  /**
   * Metodo registrar un nuevo usuario
   * @param body DTO de usuario
   * @description Crea un nuevo usuario en la base de datos
   */
  @Post('signup')
  async signUp(@Body() signupData: CreateUserDto) {
    return this.userService.createUser(signupData);
  }

  /**
   * Metodo para iniciar sesion
   * @param body DTO de login
   * @description Inicia sesion y genera un token de acceso y un refresh token
   */
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  /**
   * Metodo para refrescar el token de acceso
   * @param body DTO de refresh token
   * @description Refresca el token de acceso y genera un nuevo refresh token
   */
  @Post('refresh')
  async refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }
}
