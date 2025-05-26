import { IsNumber, IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
  @IsNumber()
  userId: number;

  @IsArray()
  @ArrayNotEmpty()
  permissionIds: number[];
}
