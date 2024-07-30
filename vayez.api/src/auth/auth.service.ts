import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './Schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Role } from './Schemas/role.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';
import { RefreshToken } from './Schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { ResetToken } from './Schemas/reset-token.schema';
import { nanoid } from 'nanoid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private mailService: MailService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const emailInuse = await this.findOneByEmail(createUserDto.email);
    if (emailInuse)
      throw new BadRequestException('This email is already in use');
    const newRole = await this.roleModel.findOne({name: createUserDto.roleId});
    if (!newRole) {
      throw new BadRequestException('given role does not exist');
    }
    const newUser = new this.userModel({  
      ...createUserDto,
      role: newRole._id,
      isActive: false,
    });
    await newUser.save();
    const token = this.generateToken(newUser._id);
    await this.mailService.sendActivationEmail(createUserDto.email, (await token).accessToken)
    return { user: newUser, token: token };
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    if (activateAccountDto.password !== activateAccountDto.confirmPassword) {
      throw new Error("passwords don't match");
    }
    const payload = this.jwtService.verify(activateAccountDto.token);
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.isActive) {
      throw new Error('Invalid or expired token');
    }
    user.password = await bcrypt.hash(activateAccountDto.password, 10);
    user.isActive = true;
    return await user.save();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleModel.find();
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    
    const user = await this.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('wrong credentials');
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('wrong credentials');
    
    const Tokens = await this.generateToken(user._id);
    return {
      ...Tokens,
      userId: user._id,
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string){
    const user = await this.userModel.findById(userId);
    if(!user){
      throw new NotFoundException('User not found');
    }
    const passwordMatch = await bcrypt.compare(oldPassword ,user.password);
    if (!passwordMatch){
      throw new UnauthorizedException('Wrong password');
    }

    const newHashedPassword = await bcrypt.hash(newPassword , 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    
    const user = await this.findOneByEmail(email);

    if (user) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }
    const user = await this.userModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async refreshToken(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token)
      throw new UnauthorizedException('Invalid or expired refresh token');
    return this.generateToken(token.userId);
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async generateToken(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1d' });
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }
  async storeRefreshToken(token: string, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  
}


