import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './Schemas/user.schema';
import { Role } from './Schemas/role.schema';
import { RefreshToken } from './Schemas/refresh-token.schema';
import { ResetToken } from './Schemas/reset-token.schema';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/CreateUser.dto';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';
import { LoginDto } from './dto/login.dto';
import { nanoid } from 'nanoid';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';


describe('AuthService', () => {
  let authService: AuthService;
  let userModel: any;
  let roleModel: any;
  let refreshTokenModel: any;
  let resetTokenModel: any;
  let mailService: MailService;
  let jwtService : JwtService;
  const mockUser = { _id: 'someId', email: 'test@example.com', password: 'hashedPassword', isActive: false };
  const mockRole = { _id: 'roleId', name: 'user' };
  const mockRefreshToken = { userId: mockUser._id, token: 'refreshToken' };
  const mockResetToken = { userId: mockUser._id, token: 'resetToken', expiryDate: new Date() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
        {
          provide: getModelToken(Role.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(ResetToken.name),
          useValue: {
            create: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('accessToken'),
            verify: jest.fn().mockReturnValue({ sub: 'someId' }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendActivationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    roleModel = module.get(getModelToken(Role.name));
    refreshTokenModel = module.get(getModelToken(RefreshToken.name));
    resetTokenModel = module.get(getModelToken(ResetToken.name));
    mailService = module.get<MailService>(MailService);
    jwtService=module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: false,
        roleId: 'roleId',
      };

      await authService.createUser(createUserDto);
      expect(userModel.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createUserDto.email,
        role: mockRole._id,
        isActive: false,
      }));
      expect(mailService.sendActivationEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'test@example.com',
        isActive: false,
        roleId: 'roleId',
      };
      jest.spyOn(authService , 'findOneByEmail').mockResolvedValue(null);
      await expect(authService.createUser(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if role does not exist', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        isActive: false,
        roleId: 'nonExistentRoleId',
      };

      jest.spyOn(roleModel, 'findOne').mockResolvedValue(null);
      await expect(authService.createUser(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('activateAccount', () => {
    it('should activate user account successfully', async () => {
      const activateAccountDto: ActivateAccountDto = {
        token: 'validToken',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      await authService.activateAccount(activateAccountDto);

      expect(userModel.findById).toHaveBeenCalledWith('someId');
      expect(userModel.findById().password).toBe('hashedNewPassword');
      expect(userModel.findById().isActive).toBe(true);
    });

    it('should throw an error if passwords do not match', async () => {
      const activateAccountDto: ActivateAccountDto = {
        token: 'validToken',
        password: 'password123',
        confirmPassword: 'differentPassword123',
      };

      await expect(authService.activateAccount(activateAccountDto)).rejects.toThrow(Error);
    });

    it('should throw an error if token is invalid or user is already active', async () => {
      const activateAccountDto: ActivateAccountDto = {
        token: 'invalidToken',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error('Invalid token'); });
      await expect(authService.activateAccount(activateAccountDto)).rejects.toThrow(Error);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await authService.login(loginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId', mockUser._id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'notfound@example.com',
        password: 'password',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change the user password successfully', async () => {
      const userId = 'someId';
      const oldPassword = 'hashedPassword';
      const newPassword = 'newPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      await authService.changePassword(userId, oldPassword, newPassword);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(userModel.findById().password).toBe('hashedNewPassword');
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonExistentId';
      const oldPassword = 'hashedPassword';
      const newPassword = 'newPassword123';

      jest.spyOn(userModel, 'findById').mockResolvedValue(null);
      await expect(authService.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const userId = 'someId';
      const oldPassword = 'wrongOldPassword';
      const newPassword = 'newPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email if user exists', async () => {
      const email = 'test@example.com';
      jest.spyOn(authService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(mailService, 'sendPasswordResetEmail').mockImplementation();

      const result = await authService.forgotPassword(email);
      expect(result).toEqual({ message: 'If this user exists, they will receive an email' });
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, expect.any(String));
    });

    it('should not send an email if user does not exist', async () => {
      const email = 'notfound@example.com';
      jest.spyOn(authService, 'findOneByEmail').mockResolvedValue(null);

      const result = await authService.forgotPassword(email);
      expect(result).toEqual({ message: 'If this user exists, they will receive an email' });
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const newPassword = 'newPassword123';
      const resetToken = 'validToken';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      await authService.resetPassword(newPassword, resetToken);

      expect(resetTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        token: resetToken,
        expiryDate: { $gte: expect.any(Date) },
      });
      expect(userModel.findById).toHaveBeenCalledWith(mockResetToken.userId);
      expect(userModel.findById().password).toBe('hashedNewPassword');
    });

    it('should throw UnauthorizedException if reset token is invalid or expired', async () => {
      const newPassword = 'newPassword123';
      const resetToken = 'invalidToken';

      jest.spyOn(resetTokenModel, 'findOneAndDelete').mockResolvedValue(null);
      await expect(authService.resetPassword(newPassword, resetToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException if user not found', async () => {
      const newPassword = 'newPassword123';
      const resetToken = 'validToken';

      jest.spyOn(resetTokenModel, 'findOneAndDelete').mockResolvedValue(mockResetToken);
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);
      await expect(authService.resetPassword(newPassword, resetToken)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const refreshToken = 'validRefreshToken';
      const result = await authService.refreshToken(refreshToken);

      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({
        token: refreshToken,
        expiryDate: { $gte: expect.any(Date) },
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if refresh token is invalid or expired', async () => {
      const refreshToken = 'invalidRefreshToken';

      jest.spyOn(refreshTokenModel, 'findOne').mockResolvedValue(null);
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return user if exists', async () => {
      const email = 'test@example.com';
      const user = await authService.findOneByEmail(email);
      expect(user).toEqual(mockUser);
    });

    it('should return null if user does not exist', async () => {
      const email = 'notfound@example.com';
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      const user = await authService.findOneByEmail(email);
      expect(user).toBeNull();
    });
  });
});
