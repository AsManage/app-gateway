import { ConfigModule } from '@nestjs/config';
import { OrganisationController } from './organisation.controller';
import { commonProvider } from 'src/constants';
import { OrganisationService } from './organisation.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule],
  controllers: [OrganisationController],
  providers: [...commonProvider, OrganisationService],
})
export class OrganisationModule {}
