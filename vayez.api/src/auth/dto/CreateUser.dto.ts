import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsNotEmpty()
  roleId: string;
}
