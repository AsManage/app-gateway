// email.service.ts

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendVerifyCode(code: string, email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Forgot Password Verify Code',
        template: './verify-code',
        context: {
          code: code,
        },
      });
      console.log('SENT CODE SUCCEED!');
    } catch (error) {
      console.log('SENT CODE FAIL!');
      console.log(String(error));
    }
  }

  async sendEmailPassword(password: string, email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Generated Password by Asmanage',
        template: './password',
        context: {
          password: password,
        },
      });
      console.log('SENT CODE SUCCEED!');
    } catch (error) {
      console.log('SENT CODE FAIL!');
      console.log(String(error));
    }
  }
}
