import { ConfigModule } from '@nestjs/config';
import { commonProvider } from 'src/constants';
import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule],
  controllers: [AssetController],
  providers: [...commonProvider, AssetService],
})
export class AssetModule {}
