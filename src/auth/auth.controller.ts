import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthDTO,
  ChangePasswordDTO,
  SendOtpDTO,
  VerifyOtpDTO,
} from './auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private authSrv: AuthService) {}

  @Post()
  async auth(@Body() payload: AuthDTO) {
    return await this.authSrv.handleAuth(payload);
  }

  @UseGuards(AuthGuard)
  @Get()
  async verifyToken() {
    return true;
  }

  @Put()
  async updatePassword(@Body() payload: AuthDTO) {
    return await this.authSrv.updateAuth(payload);
  }

  @Post('account')
  async createAccount(@Body() payload: AuthDTO) {
    return await this.authSrv.handleCreateAccount(payload);
  }

  @Post('account/otp')
  async sendResetOtp(@Body() payload: SendOtpDTO) {
    const data = await this.authSrv.handleSendOtpCode(payload);
    return data;
  }

  @Post('account/otp/verify')
  async verifyResetOtp(@Body() payload: VerifyOtpDTO) {
    return await this.authSrv.handleVerifyOtpCode(payload);
  }

  @Post('account/change-password')
  async changePassword(@Body() payload: ChangePasswordDTO) {
    return await this.authSrv.handleChangePassword(payload);
  }
}
