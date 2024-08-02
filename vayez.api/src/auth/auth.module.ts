import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Schemas/user.schema';
import { Role, RoleSchema } from './Schemas/role.schema';
import { RefreshToken, RefreshTokenSchema } from './Schemas/refresh-token.schema';
import { DictionaryController } from './dictionary.controller';
import { ResetToken } from './Schemas/reset-token.schema';
import { MailService } from 'src/mail/mail.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
    MongooseModule.forFeature([{ name: ResetToken.name, schema: RefreshTokenSchema }]),
  ],
  controllers: [AuthController, DictionaryController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
