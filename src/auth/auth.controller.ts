import { Controller, Post, Body, Put, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from 'src/guards/auth.guard';

import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from 'src/users/dto/change-pswd.dto';
import { ForgotPasswordDto } from 'src/users/dto/forgot-pswd.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-pswd.dto';

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

  /**
   * Metodo para cambiar la contraseña
   * @param body DTO de cambio de contraseña
   * @description Cambia la contraseña del usuario
   */
  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(@Body() changePswd: ChangePasswordDto, @Req() req: any) {
    const { oldPassword, newPassword } = changePswd;
    return this.userService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );
  }

  /**
   * Metodo para enviar un correo de recuperacion de contraseña
   * @param body DTO de correo
   * @description Envia un correo de recuperacion de contraseña
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPwsd: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPwsd.email);
  }

  /**
   * Metodo para cambiar la contraseña
   * @param body DTO de cambio de contraseña
   * @description Cambia la contraseña del usuario
   */
  @Put('reset-password')
  async resetPassword(@Body() resetPswd: ResetPasswordDto) {
    return this.userService.resetPassword(
      resetPswd.newPassword,
      resetPswd.resetToken
    );
  }
}
