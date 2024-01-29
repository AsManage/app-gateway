import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { commonProvider } from './constants';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { OrganisationModule } from './organisation/orrganisation.module';
import { AssetModule } from './asset/asset.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    JwtModule,
    OrganisationModule,
    AssetModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [...commonProvider, AppService],
})
export class AppModule { }
