import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { commonProvider } from 'src/constants';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule, EmailModule],
  controllers: [UserController],
  providers: [...commonProvider, UserService],
})
export class UserModule {}
