import { BadRequestException, Injectable } from '@nestjs/common';

import { SchemaService } from 'src/schema/schema.service';
import { MailService } from 'src/services/mail.service';

import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class UsersService {
  constructor(
    private schemaService: SchemaService,
    private mailService: MailService
  ) {}

  basicUserSelect = {
    id: true,
    name: true,
    email: true,
    isActive: true,
  };

  basicPermissionSelect = {
    id: true,
    module: true,
    action: true,
    description: true,
  };

  /**
   * Metodo para obtener todos los usuarios
   * @returns Un array de objetos que representan los usuarios disponibles en la base de datos.
   * @description Obtiene todos los usuarios existentes en la base de datos.
   * @throws BadRequestException si no se encuentran usuarios
   */
  async getAllUsers() {
    // Obtenemos todos los usuarios de la base de datos
    const users = await this.schemaService.user.findMany({
      select: {
        ...this.basicUserSelect,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Si no se encuentran usuarios, lanzamos una excepción
    if (!users || users.length === 0) {
      throw new BadRequestException('No users found');
    }

    return users;
  }

  /**
   * Metodo para obtener un usuario por su ID
   * @param userId ID del usuario a buscar
   * @returns Un objeto que representa el usuario encontrado.
   * @description Obtiene un usuario específico de la base de datos utilizando su ID.
   * @throws BadRequestException si no se encuentra el usuario
   */
  async getUserById(userId: number) {
    //Se busca el usuario por su ID
    const userObj = await this.schemaService.user.findUnique({
      where: { id: userId },
      select: {
        ...this.basicUserSelect,
        role: {
          select: {
            id: true,
            name: true,
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
        },
        userPermissions: {
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

    // Si no se encuentra el usuario, lanzamos una excepción
    if (!userObj) {
      throw new BadRequestException('User not found');
    }

    return userObj;
  }

  /**
   * Metodo para crear un nuevo usuario
   * @param createData Contiene los datos del usuario a crear
   * @description Crea un nuevo usuario en la base de datos
   * @throws BadRequestException si el email ya existe
   */
  async createUser(createData: CreateUserDto) {
    const { name, email, password } = createData;

    // Validamos que el email no exista
    const emailisExist = await this.schemaService.user.findUnique({
      where: {
        email: email,
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
   * Metodo para asignar un rol a un usuario
   * @param bodyDto Contiene el ID del usuario y el ID del rol a asignar
   * @description Asigna un rol a un usuario en la base de datos
   * @throws BadRequestException si el usuario o el rol no existen
   */
  async assignRoleToUser(bodyDto: AssignRoleDto) {
    const { userId, roleId } = bodyDto;

    // Validamos que el usuario exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userObj) {
      throw new BadRequestException('User not found');
    }

    // Validamos que el rol exista
    const roleObj = await this.schemaService.role.findUnique({
      where: {
        id: roleId,
      },
    });
    if (!roleObj) {
      throw new BadRequestException('Role not found');
    }

    // Asignamos el rol al usuario
    await this.schemaService.user.update({
      where: {
        id: userId,
      },
      data: {
        role: {
          connect: {
            id: roleId,
          },
        },
      },
    });
  }

  /**
   * Metodo para asignar permisos a un usuario
   * @param bodyDto Contiene el ID del usuario y los IDs de los permisos a asignar
   * @description Asigna permisos a un usuario en la base de datos
   * @throws BadRequestException si el usuario o los permisos no existen
   */
  async assignPermissionsToUser(bodyDto: AssignPermissionsDto) {
    const { userId, permissionIds } = bodyDto;

    // Validamos que el usuario exista
    const userObj = await this.schemaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userObj) {
      throw new BadRequestException('User not found');
    }

    // Validamos que los permisos existan
    const permissions = await this.schemaService.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    });
    if (!permissions || permissions.length === 0) {
      throw new BadRequestException('Permissions not found');
    }

    // Limpiamos los permisos actuales y volvemos a asignar los nuevos
    await this.schemaService.userPermission.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Insertamos los nuevos permiosos
    const assignments = permissionIds.map((permissionId) => ({
      userId,
      permissionId,
    }));

    // Asignamos los permisos al usuario
    await this.schemaService.userPermission.createMany({
      data: assignments,
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
