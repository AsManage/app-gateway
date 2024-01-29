import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('')
export class AppController {
  constructor(private appSrv: AppService) {}

  @Get()
  async getHelloText() {
    const data = await this.appSrv.getHello();
    return data;
  }
}
