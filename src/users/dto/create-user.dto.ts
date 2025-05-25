import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'la contraseña debe tener al menos 6 caracteres',
  })
  @Matches(/^(?=.*[0-9])/, {
    message: 'la contraseña debe contener al menos un número',
  })
  password: string;
}
