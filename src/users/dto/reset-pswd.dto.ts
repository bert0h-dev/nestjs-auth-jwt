import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, {
    message: 'la contraseña debe tener al menos 6 caracteres',
  })
  @Matches(/^(?=.*[0-9])/, {
    message: 'la contraseña debe contener al menos un número',
  })
  newPassword: string;

  @IsString()
  resetToken: string;
}
