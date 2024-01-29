import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { commonProvider } from 'src/constants';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule, EmailModule],
  controllers: [AuthController],
  providers: [...commonProvider, AuthService],
})
export class AuthModule {}
