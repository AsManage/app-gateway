import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import {
  LocationDTO,
  OrgUnitDTO,
  OrganisationUnitTypeDTO,
  TenantInformationDTO,
} from './organisation.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('organisation')
export class OrganisationController {
  constructor(private organisationService: OrganisationService) {}

  @Post('tenant')
  async createOrganisation(@Body() payload: TenantInformationDTO) {
    return await this.organisationService.createTenant(payload);
  }

  @Get('tenant')
  async getTenantInfo(@Req() req: Request) {
    const { tenantId } = req['user'];
    return await this.organisationService.getTenantInfo({
      tenantId,
    });
  }

  @Post('orgUnitType')
  async addNewOrgUnitType(
    @Req() req: Request,
    @Body() payload: { name: string },
  ) {
    const { tenantId } = req['user'];
    return await this.organisationService.addOrgUnitType({
      name: payload.name,
      tenantId,
    });
  }
  @Get('orgUnitTypes')
  async getOrgUnitTypes(
    @Req() req: Request,
    @Query() params: OrganisationUnitTypeDTO,
  ) {
    const { tenantId } = req['user'];

    return await this.organisationService.getListOrgUnitTypes({
      tenantId,
      ...params,
    });
  }
  @Put('orgUnitType')
  async updateOrgUnitTypes(
    @Req() req: Request,
    @Body() payload: { typeId: number; name: string },
  ) {
    const { tenantId, id } = req['user'];

    return await this.organisationService.updateOrgUnitTypes({
      tenantId,
      updatedId: id,
      ...payload,
    });
  }
  @Delete('orgUnitType')
  async deleteOrgUnitTypes(
    @Req() req: Request,
    @Query() payload: { typeId: number },
  ) {
    const { tenantId, id } = req['user'];
    return await this.organisationService.deleteOrgUnitTypes({
      tenantId,
      deletedId: id,
      ...payload,
    });
  }

  @Post('orgUnit')
  async addOrgUnit(@Req() req: Request, @Body() payload: OrgUnitDTO) {
    const { tenantId } = req['user'];
    return await this.organisationService.addOrgUnit(payload, tenantId);
  }
  @Get('orgUnit')
  async getOrgUnit(@Req() req: Request) {
    const { tenantId } = req['user'];
    return await this.organisationService.getOrgUnit({
      tenantId,
    });
  }
  @Put('orgUnit')
  async updateOrgUnit(@Body() payload: OrgUnitDTO & { ouId: string }) {
    return await this.organisationService.updateOrgUnit(payload);
  }

  @Delete('orgUnit')
  async deleteOrgUnit(@Query() payload: { ouId: string }) {
    return await this.organisationService.deleteOrgUnit(payload);
  }

  @Get('location')
  async getLocation(@Req() req: Request) {
    const { tenantId } = req['user'];
    return await this.organisationService.getLocation({ tenantId });
  }

  @Post('location')
  async addLocation(@Req() req: Request, @Body() payload: LocationDTO) {
    const { tenantId } = req['user'];
    return await this.organisationService.addLocation({ ...payload, tenantId });
  }

  @Post('location/assign')
  async assignLocationToOrgUnit(
    @Body() payload: { locationId: number; orgUnitId: number },
  ) {
    return await this.organisationService.assignLocationToOrgUnit(payload);
  }
}
