import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/Refresh-Token.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { AuthenticationGuard } from '../Guards/authentication.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' }, 
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createUser: jest.fn(),
            activateAccount: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        JwtService,
        AuthenticationGuard,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });


  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: false,
        roleId: 'roleId',
      };

      jest.spyOn(authService, 'createUser').mockResolvedValue(createUserDto as any);
      const result = await authController.createUser(createUserDto);

      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createUserDto);
    });
  });

  describe('activateAccount', () => {
    it('should activate a user account successfully', async () => {
      const activateAccountDto: ActivateAccountDto = {
        token: 'validToken',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      jest.spyOn(authService, 'activateAccount').mockResolvedValue(undefined);
      const result = await authController.activateAccount(activateAccountDto);

      expect(authService.activateAccount).toHaveBeenCalledWith(activateAccountDto);
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login successfully and return user data', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const expectedResponse = { accessToken: 'token', refreshToken: 'refreshToken', userId: 'userId' };
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);
      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh the token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refreshToken' };
      const expectedResponse = { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(expectedResponse);
      const result = await authController.refreshToken(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const req = { userId: 'userId' };

      jest.spyOn(authService, 'changePassword').mockResolvedValue(undefined);
      const result = await authController.changePassword(changePasswordDto, req);

      expect(authService.changePassword).toHaveBeenCalledWith(req.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword);
      expect(result).toBeUndefined();
    });
  });

  describe('forgetPassword', () => {
    it('should send a forget password email', async () => {
      const forgetPasswordDto: ForgetPasswordDto = {
        email: 'john.doe@example.com',
      };

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue({ message: 'If this user exists, they will receive an email' });
      const result = await authController.forgetPassword(forgetPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgetPasswordDto.email);
      expect(result).toEqual({ message: 'If this user exists, they will receive an email' });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        resetToken: 'validToken',
        newPassword: 'newPassword123',
      };

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(undefined);
      const result = await authController.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto.newPassword, resetPasswordDto.resetToken);
      expect(result).toBeUndefined();
    });
  });
});
