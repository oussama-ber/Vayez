import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../Schemas/role.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  LastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsNotEmpty()
  roleId: string;
}
