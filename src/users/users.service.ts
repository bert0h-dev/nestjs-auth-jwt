import { BadRequestException, Injectable } from '@nestjs/common';

import { SchemaService } from 'src/schema/schema.service';
import { MailService } from 'src/services/mail.service';

import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(
    private schemaService: SchemaService,
    private mailService: MailService
  ) {}

  /**
   * Metodo para crear un nuevo usuario
   * @param body DTO de usuario
   * @description Crea un nuevo usuario en la base de datos
   * @throws BadRequestException si el email ya existe
   */
  async createUser(createData: CreateUserDto) {
    const { name, email, password } = createData;

    // Validamos que el email no exista
    const emailisExist = await this.schemaService.user.findUnique({
      where: {
        email: createData.email,
      },
    });
    if (emailisExist) {
      throw new BadRequestException('This email already exists');
    }

    // Realizamos el hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardamos el usuario en la base de datos
    await this.schemaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  /**
   * Metodo para cambiar la contraseña
   * @param userId ID del usuario
   * @param oldPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @description Cambia la contraseña del usuario
   * @throws BadRequestException si el usuario no existe o la contraseña es incorrecta
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    // Validamos que el usuario exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userObj) {
      throw new BadRequestException('User not found');
    }

    // Validamos que la contraseña sea correcta
    const isPasswordValid = await bcrypt.compare(oldPassword, userObj.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Wrong credentials');
    }

    // Realizamos el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizamos la contraseña en la base de datos
    await this.schemaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Metodo para reiniciar la contraseña
   * @param newPassword Nueva contraseña
   * @param token Token de recuperacion
   * @description Cambia la contraseña del usuario
   * @throws BadRequestException si el token no existe o ha expirado
   * @throws BadRequestException si el usuario no existe
   */
  async resetPassword(newPassword: string, token: string) {
    // Validamos que el token exista
    const tokenObj = await this.schemaService.resetToken.findUnique({
      where: {
        token,
      },
    });
    if (!tokenObj) {
      throw new BadRequestException('Invalid token');
    }

    // Verificamos que el token no haya expirado
    if (tokenObj.expirationDate < new Date()) {
      throw new BadRequestException('Token expired');
    }

    // Validamos que el usuario exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        id: tokenObj.userId,
      },
    });
    if (!userObj) {
      throw new BadRequestException('User not found');
    }

    // Validamos que la nueva contraseña sea diferente a la actual
    const isPasswordValid = await bcrypt.compare(newPassword, userObj.password);
    if (isPasswordValid) {
      throw new BadRequestException(
        'New password cannot be the same as the old one'
      );
    }

    // Realizamos el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizamos la contraseña en la base de datos
    await this.schemaService.user.update({
      where: {
        id: tokenObj.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Eliminamos el token de la base de datos
    await this.schemaService.resetToken.delete({
      where: {
        id: tokenObj.id,
      },
    });
  }

  /**
   * Metodo para enviar un correo de recuperacion de contraseña
   * @param email Correo del usuario
   * @description Envia un correo de recuperacion de contraseña
   * @throws BadRequestException si el email no existe
   */
  async forgotPassword(email: string) {
    // Validamos que el email exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userObj) {
      // Se genera un token de recuperacion
      const resetToken = nanoid(64);

      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1); // 1 hora

      // Guardamos el token en la base de datos
      await this.schemaService.resetToken.create({
        data: {
          userId: userObj.id,
          token: resetToken,
          expirationDate,
        },
      });

      // Enviamos el correo de recuperacion
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return {
      message: 'If the email exists, a recovery email will be sent.',
    };
  }
}
