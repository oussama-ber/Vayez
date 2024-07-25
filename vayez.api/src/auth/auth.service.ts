import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './Schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Role } from './Schemas/role.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { ActivateAccountDto } from './dto/ActivateAccount.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const emailInuse = await this.findOneByEmail(createUserDto.email);
    if (emailInuse)
      throw new BadRequestException('This email is already in use');
    const newRole = await this.roleModel.findById(createUserDto.roleId).exec();
    if (!newRole) {
      throw new BadRequestException('given role does not exist');
    }
    const newUser = new this.userModel({
      ...createUserDto,
      role: (await newRole).id,
      isActive: false,
    });
    await newUser.save();
    const token = this.generateToken(newUser._id);
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

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  private generateToken(userId: Types.ObjectId): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }
}
