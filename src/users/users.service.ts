import { BadRequestException, Injectable } from '@nestjs/common';

import { SchemaService } from 'src/schema/schema.service';

import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private schemaService: SchemaService) {}

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
}
