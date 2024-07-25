import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { Role } from 'src/decorator/role.decorator';
import { AuthenticationGuard } from 'src/Guards/authentication.guard';
import { AuthorizationGuard } from 'src/Guards/authorization.guard';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //@Role('admin')
  //@UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
  @Post('activate')
  async activateAccount(@Body() activateAccountDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateAccountDto);
  }
}
