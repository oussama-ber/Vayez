import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { Role } from '../decorator/role.decorator';
import { AuthenticationGuard } from '../Guards/authentication.guard';
import { AuthorizationGuard } from '../Guards/authorization.guard';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/Refresh-Token.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Role('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
  @Post('activate')
  async activateAccount(@Body() activateAccountDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateAccountDto);
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenData: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenData.refreshToken);
  }

  @UseGuards(AuthenticationGuard)
  @Post('change-password')
  async changePassword (
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req ,
  ) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
  @Post('forget-password')
  async forgetPassword (@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgotPassword(forgetPasswordDto.email);
  }

  @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }
}
